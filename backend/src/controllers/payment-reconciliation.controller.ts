import { RequestHandler } from "express";
import { reconcilePendingPayments } from "../services/order-payment.service";

export const reconcile: RequestHandler = async (_request, response) => {
  const processed = await reconcilePendingPayments();
  response.status(200).json({ status: "ok", processed });
};
