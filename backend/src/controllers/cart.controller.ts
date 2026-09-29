import { Request, Response } from "express";
import {
  addListingToCart,
  clearUserCart,
  listUserCart,
  removeListingFromCart,
  updateCartItemQuantity,
} from "../services/cart.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validateCartQuantityInput, validateListingIdParam } from "../validators/cart.validator";

class CartController {
  static async list(req: Request, res: Response): Promise<void> {
    const cart = await listUserCart(requireAuthenticatedUserId(req));
    res.status(200).json(cart);
  }

  static async add(req: Request, res: Response): Promise<void> {
    const listingId = validateListingIdParam(req.params.listingId as string);
    const item = await addListingToCart(requireAuthenticatedUserId(req), listingId);
    res.status(201).json(item);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const listingId = validateListingIdParam(req.params.listingId as string);
    await removeListingFromCart(requireAuthenticatedUserId(req), listingId);
    res.status(204).send();
  }

  static async update(req: Request, res: Response): Promise<void> {
    const listingId = validateListingIdParam(req.params.listingId as string);
    const quantity = validateCartQuantityInput(req.body);
    const item = await updateCartItemQuantity(
      requireAuthenticatedUserId(req),
      listingId,
      quantity,
    );
    res.status(200).json(item);
  }

  static async clear(req: Request, res: Response): Promise<void> {
    await clearUserCart(requireAuthenticatedUserId(req));
    res.status(204).send();
  }
}

export default CartController;
