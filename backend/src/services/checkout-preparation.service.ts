import { Op } from "sequelize";
import Order from "../models/Order";
import { AppError } from "../utils/app-error";

export function validatePaymentReference(value: unknown): string {
  if (typeof value !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)) {
    throw new AppError(400, "INVALID_PAYMENT", "Referência de pagamento inválida.");
  }
  return value;
}

export async function getCheckoutPreparation(reference: string) {
  const order = await Order.findOne({ where: { paymentReference: reference,
    status: "pending", checkoutUrl: null, paymentExpiresAt: { [Op.gt]: new Date() } } });
  if (!order) return null;
  return { reference, orderNumber: order.orderNumber, orderId: order.id,
    amountCents: Math.round(Number(order.totalAmount) * 100),
    expiresAt: order.paymentExpiresAt!.toISOString() };
}

export async function savePreparedCheckout(reference: string, value: unknown) {
  let url: URL;
  try { url = new URL(typeof value === "string" ? value : ""); }
  catch { throw new AppError(400, "INVALID_PAYMENT", "Endereço de pagamento inválido."); }
  if (url.protocol !== "https:" || url.port || url.username || url.password ||
      !["www.mercadopago.com.br", "sandbox.mercadopago.com.br"].includes(url.hostname)) {
    throw new AppError(400, "INVALID_PAYMENT", "Endereço de pagamento inválido.");
  }
  await Order.update({ checkoutUrl: url.href }, { where: { paymentReference: reference,
    status: "pending", checkoutUrl: null, paymentExpiresAt: { [Op.gt]: new Date() } } });
}
