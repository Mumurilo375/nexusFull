import { Request, Response } from "express";
import { listUserPurchaseHistory } from "../services/history.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validateListOrdersQuery } from "../validators/order.validator";

class HistoryController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListOrdersQuery(req.query);
    const history = await listUserPurchaseHistory(requireAuthenticatedUserId(req), query);
    res.status(200).json(history);
  }
}

export default HistoryController;
