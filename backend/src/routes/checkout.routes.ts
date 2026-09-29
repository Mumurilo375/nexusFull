import { Router } from "express";
import CheckoutController from "../controllers/checkout.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const checkoutRouter = Router();
checkoutRouter.use(authMiddleware);

checkoutRouter.post("/", CheckoutController.create);

export default checkoutRouter;
