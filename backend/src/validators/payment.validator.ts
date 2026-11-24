import { Payment } from "../services/payment.service";
import { AppError } from "../utils/app-error";

export function validatePaymentNotification(body: unknown): Payment {
  const payment = body as Partial<Payment> | null;
  if (!payment || typeof payment.id !== "string" || !/^\d+$/.test(payment.id) ||
    typeof payment.reference !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(payment.reference) ||
    typeof payment.status !== "string" || payment.status.length > 30 ||
    !Number.isSafeInteger(payment.amountCents) || Number(payment.amountCents) <= 0 ||
    typeof payment.currency !== "string" || payment.currency.length !== 3) {
    throw new AppError(400, "INVALID_PAYMENT", "Invalid payment notification");
  }
  return payment as Payment;
}
