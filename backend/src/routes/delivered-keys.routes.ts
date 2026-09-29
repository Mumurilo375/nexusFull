import { Router } from "express";
import DeliveredKeyController from "../controllers/delivered-key.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const deliveredKeysRouter = Router();
deliveredKeysRouter.use(authMiddleware);

deliveredKeysRouter.get("/", DeliveredKeyController.list);
deliveredKeysRouter.get("/:id", DeliveredKeyController.get);

export default deliveredKeysRouter;
