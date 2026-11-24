import { Router } from "express";
import CheckoutController from "../controllers/checkout.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const checkoutRouter = Router();
checkoutRouter.use(authMiddleware);

checkoutRouter.post("/", CheckoutController.create);
checkoutRouter.get("/", CheckoutController.current);
checkoutRouter.post("/:id/cancel", CheckoutController.cancel);
checkoutRouter.get("/:id", CheckoutController.get);
checkoutRouter.post("/:id/refresh", CheckoutController.get);

export default checkoutRouter;
