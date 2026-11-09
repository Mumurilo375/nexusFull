import { randomUUID } from "node:crypto";
import { Transaction } from "sequelize";
import sequelize from "../config/database";
import { invalidateCatalogCache } from "../config/cache";
import CartItem from "../models/CartItem";
import GameKey from "../models/GameKey";
import GamePlatformListing from "../models/GamePlatformListing";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { AppError, requireFound } from "../utils/app-error";
import { buildPricing, roundMoney, toNumber } from "../utils/money";
import { findAvailableGameKeysForCheckout } from "../utils/stock";
import { getActiveDiscountPercentage } from "./catalog.shared";
import Users from "../models/Users";
import { failPendingOrder, refreshOrderPayment } from "./order-payment.service";
import { requestPaymentService } from "./payment.service";

type CartItemWithListing = CartItem & {
  listing?: GamePlatformListing;
};

type SelectedCheckoutItem = {
  listing: GamePlatformListing;
  gameKeys: GameKey[];
  finalPrice: number;
};

function generateOrderNumber(userId: number): string {
  return `NEX-${userId}-${Date.now()}`;
}

function ensureListingIsAvailable(listing: GamePlatformListing | undefined) {
  if (!listing || !listing.get("isActive")) {
    throw new AppError(
      409,
      "LISTING_UNAVAILABLE",
      "Um item do seu carrinho nao esta mais disponivel.",
    );
  }

  return listing;
}

function readCartQuantity(cartItem: CartItem) {
  return Math.max(1, toNumber(cartItem.get("quantity")));
}

async function loadUserCartItems(userId: number, transaction: Transaction) {
  const cartItems = await CartItem.findAll({
    where: { userId },
    include: [
      {
        model: GamePlatformListing,
        as: "listing",
      },
    ],
    order: [["listingId", "ASC"]],
    transaction,
  });

  if (cartItems.length === 0) {
    throw new AppError(400, "CART_EMPTY", "Seu carrinho esta vazio.");
  }

  return cartItems as CartItemWithListing[];
}

async function selectCheckoutItems(
  cartItems: CartItemWithListing[],
  transaction: Transaction,
) {
  const selectedItems: SelectedCheckoutItem[] = [];
  let subtotal = 0;
  let discountAmount = 0;

  for (const cartItem of cartItems) {
    const listing = ensureListingIsAvailable(cartItem.listing);
    const listingId = toNumber(listing.id);
    const basePrice = toNumber(listing.get("price"));

    if (basePrice <= 0) {
      throw new AppError(400, "INVALID_PRICE", "Preco invalido para um item do carrinho.");
    }

    const quantity = readCartQuantity(cartItem);
    const gameKeys = await findAvailableGameKeysForCheckout(listingId, quantity, transaction);

    if (gameKeys.length < quantity) {
      throw new AppError(
        409,
        "OUT_OF_STOCK",
        "O estoque do carrinho mudou. Revise as quantidades antes de finalizar o pedido.",
      );
    }

    const pricing = buildPricing(
      basePrice,
      await getActiveDiscountPercentage(listingId, transaction),
    );

    selectedItems.push({
      listing,
      gameKeys,
      finalPrice: pricing.finalPrice,
    });

    subtotal += roundMoney(basePrice * quantity);
    discountAmount += roundMoney(pricing.discountAmount * quantity);
  }

  const roundedSubtotal = roundMoney(subtotal);
  const roundedDiscountAmount = roundMoney(discountAmount);

  return {
    selectedItems,
    subtotal: roundedSubtotal,
    discountAmount: roundedDiscountAmount,
    totalAmount: roundMoney(roundedSubtotal - roundedDiscountAmount),
  };
}

export function checkoutSummary(order: Order) {
  return {
    id: order.id, orderNumber: order.orderNumber, totalAmount: order.totalAmount,
    status: order.status, checkoutUrl: order.status === "pending" ? order.checkoutUrl : null,
    paymentExpiresAt: order.paymentExpiresAt,
  };
}

export async function getCheckout(userId: number, orderId?: number, refresh = false) {
  const order = orderId
    ? requireFound(await Order.findOne({ where: { id: orderId, userId } }), "ORDER_NOT_FOUND", "Order not found")
    : await Order.findOne({ where: { userId, status: "pending" } });
  if (order && refresh) {
    await refreshOrderPayment(order);
    await order.reload();
  }
  return { order: order ? checkoutSummary(order) : null };
}

export async function checkoutUserCart(userId: number) {
  const { order, created } = await sequelize.transaction(async (transaction) => {
    // Serializar compras do mesmo usuário evita dois pedidos para o mesmo carrinho.
    await Users.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
    const pending = await Order.findOne({ where: { userId, status: "pending" }, transaction });
    if (pending) return { order: pending, created: false };
    const cartItems = await loadUserCartItems(userId, transaction);
    const pricing = await selectCheckoutItems(cartItems, transaction);
    const now = new Date();
    const order = await Order.create({
      orderNumber: generateOrderNumber(userId), userId, status: "pending",
      subtotal: pricing.subtotal, discountAmount: pricing.discountAmount, totalAmount: pricing.totalAmount,
      paymentMethod: "mercado_pago", paymentStatus: "pending", paymentReference: randomUUID(),
      paymentExpiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    }, { transaction });
    for (const item of pricing.selectedItems) {
      for (const key of item.gameKeys) {
        await key.update({ status: "reserved", reservedAt: now }, { transaction });
        await OrderItem.create({
          orderId: order.id, listingId: item.listing.id, gameKeyId: key.id, price: item.finalPrice,
        }, { transaction });
      }
    }
    return { order, created: true };
  });
  if (created) {
    try {
      const payment = await requestPaymentService<{ checkoutUrl: string }>("/payments", {
        reference: order.paymentReference, orderNumber: order.orderNumber, orderId: order.id,
        amountCents: Math.round(Number(order.totalAmount) * 100), expiresAt: order.paymentExpiresAt,
      });
      const url = new URL(payment.checkoutUrl);
      if (url.protocol !== "https:" || !["www.mercadopago.com.br", "sandbox.mercadopago.com.br"].includes(url.hostname)) {
        throw new AppError(502, "PAYMENT_UNAVAILABLE", "Payment service unavailable");
      }
      await Order.update({ checkoutUrl: url.href }, { where: { id: order.id, status: "pending" } });
      await order.reload();
    } catch (error) {
      await failPendingOrder(order.id);
      throw error;
    }
    await invalidateCatalogCache();
  }
  return { order: checkoutSummary(order) };
}
