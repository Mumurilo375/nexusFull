import { Request, Response } from "express";
import { checkoutUserCart, getCheckout } from "../services/checkout.service";
import { receivePayment } from "../services/order-payment.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validatePaymentNotification } from "../validators/payment.validator";
import { validateOrderIdParam } from "../validators/order.validator";

class CheckoutController {
  static async create(req: Request, res: Response): Promise<void> {
    const order = await checkoutUserCart(requireAuthenticatedUserId(req));
    res.status(201).json(order);
  }

  static async current(req: Request, res: Response) {
    res.json(await getCheckout(requireAuthenticatedUserId(req)));
  }

  static async get(req: Request, res: Response) {
    res.json(await getCheckout(requireAuthenticatedUserId(req),
      validateOrderIdParam(req.params.id as string), req.method === "POST"));
  }

  static async notification(req: Request, res: Response) {
    await receivePayment(validatePaymentNotification(req.body));
    res.sendStatus(200);
  }
}

export default CheckoutController;
