import { Request, Response } from "express";
import { checkoutUserCart } from "../services/checkout.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validateCheckoutInput } from "../validators/checkout.validator";

class CheckoutController {
  static async create(req: Request, res: Response): Promise<void> {
    const input = validateCheckoutInput(req.body);
    const order = await checkoutUserCart(requireAuthenticatedUserId(req), input);
    res.status(201).json(order);
  }
}

export default CheckoutController;
