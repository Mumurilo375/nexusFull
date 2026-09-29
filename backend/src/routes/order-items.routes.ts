import { Router } from "express";
import OrderItemController from "../controllers/order-item.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const orderItemsRouter = Router();
orderItemsRouter.use(authMiddleware);

orderItemsRouter.get("/", OrderItemController.list);
orderItemsRouter.get("/:id", OrderItemController.get);

export default orderItemsRouter;
