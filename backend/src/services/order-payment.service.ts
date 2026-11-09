import { Op, Transaction } from "sequelize";
import sequelize from "../config/database";
import { invalidateCatalogCache } from "../config/cache";
import CartItem from "../models/CartItem";
import DeliveredKey from "../models/DeliveredKey";
import GameKey from "../models/GameKey";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { AppError } from "../utils/app-error";
import { Payment, requestPaymentService } from "./payment.service";

const terminalStatuses = ["rejected", "cancelled", "refunded", "charged_back"];
const activeStatuses = ["pending", "in_process", "authorized", "in_mediation"];

async function loadReservedItems(orderId: number, transaction: Transaction) {
  return OrderItem.findAll({ where: { orderId }, order: [["id", "ASC"]], transaction });
}

export async function failPendingOrder(orderId: number) {
  await sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!order || order.status !== "pending") return;
    const items = await loadReservedItems(orderId, transaction);
    const ids = items.map((item) => item.gameKeyId).filter((id): id is number => id !== null);
    await GameKey.update({ status: "available", reservedAt: null }, {
      where: { id: ids, status: "reserved" }, transaction,
    });
    // Desvincular permite que a chave liberada seja usada em outro pedido.
    await OrderItem.update({ gameKeyId: null }, { where: { orderId }, transaction });
    await order.update({ status: "failed", paymentStatus: "failed", cancelledAt: new Date(), checkoutUrl: null }, { transaction });
  });
  await invalidateCatalogCache();
}

export async function processPayment(payment: Payment) {
  const result = await sequelize.transaction(async (transaction) => {
    const order = await Order.findOne({
      where: { paymentReference: payment.reference }, transaction, lock: transaction.LOCK.UPDATE,
    });
    if (!order) return "ignored";
    if (payment.status !== "approved") {
      // Uma chave já entregue nunca volta ao estoque após estorno.
      if (order.status === "paid" && order.paymentId === payment.id &&
        ["refunded", "charged_back"].includes(payment.status)) {
        await order.update({ status: "failed", paymentStatus: "failed", cancelledAt: new Date() }, { transaction });
        return "changed";
      }
      return "ignored";
    }
    if (order.status === "paid" && order.paymentId === payment.id) return "ignored";
    if (order.status !== "pending" || payment.currency !== "BRL" ||
      payment.amountCents !== Math.round(Number(order.totalAmount) * 100)) return "refund";

    const items = await loadReservedItems(order.id, transaction);
    const keys = await GameKey.findAll({
      where: { id: items.map((item) => item.gameKeyId) }, transaction, lock: transaction.LOCK.UPDATE,
    });
    if (!items.length || keys.length !== items.length || keys.some((key) => key.status !== "reserved")) {
      throw new AppError(409, "RESERVATION_LOST", "Payment reservation unavailable");
    }
    const now = new Date();
    for (const item of items) {
      await DeliveredKey.create({ userId: order.userId, orderItemId: item.id, gameKeyId: item.gameKeyId, deliveredAt: now }, { transaction });
    }
    await GameKey.update({ status: "sold", reservedAt: null, soldAt: now }, {
      where: { id: keys.map((key) => key.id) }, transaction,
    });
    // Preservar itens novos ou quantidades alteradas durante o pagamento.
    const quantities = new Map<number, number>();
    for (const item of items) quantities.set(item.listingId, (quantities.get(item.listingId) ?? 0) + 1);
    for (const [listingId, quantity] of quantities) {
      await CartItem.destroy({ where: { userId: order.userId, listingId, quantity }, transaction });
    }
    await order.update({
      status: "paid", paymentStatus: "succeeded", paymentId: payment.id, paymentConfirmedAt: now, checkoutUrl: null,
    }, { transaction });
    return "changed";
  });
  // A chamada ao gateway acontece fora da transação do banco.
  if (result === "refund") await requestPaymentService(`/payments/${payment.id}/refund`, {});
  if (result === "changed") await invalidateCatalogCache();
}

export async function refreshOrderPayment(order: Order) {
  if (!order.paymentReference) return;
  const payments = await requestPaymentService<Payment[]>(`/payments/${order.paymentReference}`);
  for (const payment of payments.filter((payment) => payment.status === "approved")) await processPayment(payment);
  for (const payment of payments.filter((payment) => payment.status !== "approved")) await processPayment(payment);
  await order.reload();
  if (order.status !== "pending") return;
  const expired = Boolean(order.paymentExpiresAt && order.paymentExpiresAt.getTime() <= Date.now());
  const active = payments.filter((payment) => activeStatuses.includes(payment.status));
  if (expired && active.length) {
    for (const payment of active) {
      const cancelled = await requestPaymentService<Payment>(`/payments/${payment.id}/cancel`, {});
      await processPayment(cancelled);
    }
    return; // Conferir o resultado no próximo ciclo antes de liberar o estoque.
  }
  if (active.length || payments.some((payment) => !terminalStatuses.includes(payment.status))) return;
  if (expired || payments.length) await failPendingOrder(order.id);
}

export async function receivePayment(payment: Payment) {
  await processPayment(payment);
  if (terminalStatuses.includes(payment.status)) {
    const order = await Order.findOne({ where: { paymentReference: payment.reference } });
    if (order?.status === "pending") await refreshOrderPayment(order);
  }
}

export async function reconcilePendingPayments(): Promise<number> {
  const orders = await Order.findAll({ where: {
    paymentReference: { [Op.ne]: null },
    [Op.or]: [{ status: "pending" }, { paymentExpiresAt: { [Op.gte]: new Date(Date.now() - 86400000) } }],
  }, order: [["id", "ASC"]] });

  let failed = false;
  for (const order of orders) {
    try {
      await refreshOrderPayment(order);
    } catch {
      failed = true;
      console.warn(`Pagamento do pedido ${order.id} será conferido novamente.`);
    }
  }

  if (failed) {
    throw new AppError(
      503,
      "PAYMENT_RECONCILIATION_FAILED",
      "Não foi possível concluir a conferência dos pagamentos.",
    );
  }

  return orders.length;
}
