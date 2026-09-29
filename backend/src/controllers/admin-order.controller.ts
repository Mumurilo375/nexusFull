import { Request, Response } from "express";
import { getAdminOrderById, listAdminOrders } from "../services/admin-order.service";
import {
  validateAdminOrderIdParam,
  validateListAdminOrdersQuery,
} from "../validators/admin-order.validator";

class AdminOrderController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListAdminOrdersQuery(req.query);
    const orders = await listAdminOrders(query);
    res.status(200).json(orders);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const orderId = validateAdminOrderIdParam(req.params.id as string);
    const order = await getAdminOrderById(orderId);
    res.status(200).json(order);
  }
}

export default AdminOrderController;
