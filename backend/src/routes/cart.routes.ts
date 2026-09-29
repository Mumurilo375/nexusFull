import { Router } from "express";
import CartController from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const cartRouter = Router();
cartRouter.use(authMiddleware);

cartRouter.get("/", CartController.list);
cartRouter.post("/:listingId", CartController.add);
cartRouter.patch("/:listingId", CartController.update);
cartRouter.delete("/:listingId", CartController.remove);
cartRouter.delete("/", CartController.clear);

export default cartRouter;
