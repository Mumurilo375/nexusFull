import { Request, Response } from "express";
import { getUserOrderItemById, listUserOrderItems } from "../services/order-item.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import {
  validateListOrderItemsQuery,
  validateOrderItemIdParam,
} from "../validators/order-item.validator";

class OrderItemController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListOrderItemsQuery(req.query);
    const items = await listUserOrderItems(requireAuthenticatedUserId(req), query);
    res.status(200).json(items);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const orderItemId = validateOrderItemIdParam(req.params.id as string);
    const item = await getUserOrderItemById(requireAuthenticatedUserId(req), orderItemId);
    res.status(200).json(item);
  }
}

export default OrderItemController;
