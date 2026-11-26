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

export async function retryCheckoutPreparation(userId: number, orderId: number) {
  const order = requireFound(
    await Order.findOne({ where: { id: orderId, userId } }),
    "ORDER_NOT_FOUND",
    "Order not found",
  );
  if (order.status !== "pending" || order.checkoutUrl) return { order: checkoutSummary(order) };
  if (!order.paymentExpiresAt || order.paymentExpiresAt.getTime() <= Date.now()) {
    throw new AppError(409, "CHECKOUT_EXPIRED", "O prazo para preparar este pagamento expirou.");
  }
  await requestPaymentService<{ checkoutUrl: string }>("/checkouts", { reference: order.paymentReference });
  await order.reload();
  return { order: checkoutSummary(order) };
}
// aqui comeca o pedido !!
export async function checkoutUserCart(userId: number) {
  const { order, created } = await sequelize.transaction(async (transaction) => {
    //Confere o carrinho do user e reutiliza um pedido pendente, se existir
    await Users.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
    const pending = await Order.findOne({ where: { userId, status: "pending" }, transaction });
    if (pending) return { order: pending, created: false };

    const cartItems = await loadUserCartItems(userId, transaction);
    //consulta os preços e descontos e verifica se tem chave pra esse jogo
    const pricing = await selectCheckoutItems(cartItems, transaction);

    const now = new Date();

    //Cria o pedido com status pendente.
    const order = await Order.create({
      orderNumber: generateOrderNumber(userId),
      userId,
      status: "pending",
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      totalAmount: pricing.totalAmount,
      paymentMethod: "mercado_pago",
      paymentStatus: "pending",

      //Cria um UUID para associar o pedido ao pagamento
      paymentReference: randomUUID(),

      paymentExpiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    }, { transaction });

    //Reserva as chaves para o pedido
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

  //Solicita ao serviço de pagamentos que prepare o checkout
  if (created && order.paymentReference) {
    try {
      await requestPaymentService<{ checkoutUrl: string }>("/checkouts", { reference: order.paymentReference });
      await order.reload();
    } catch {
      await failPendingOrder(order.id, true);
      throw new AppError(503, "PAYMENT_UNAVAILABLE", "O serviço de pagamento demorou para responder. Tente novamente.");
    }
  }

  if (created) await invalidateCatalogCache();
  return { order: checkoutSummary(order) };
}
