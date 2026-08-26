import { Router } from "express";
import GameImageController from "../controllers/game-image.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const gameImagesRouter = Router();

gameImagesRouter.get("/", GameImageController.list);
gameImagesRouter.get("/:id", GameImageController.get);
gameImagesRouter.post("/", authMiddleware, requirePermission(PERMISSIONS.CATALOG_MANAGE), GameImageController.create);
gameImagesRouter.put("/:id", authMiddleware, requirePermission(PERMISSIONS.CATALOG_MANAGE), GameImageController.update);
gameImagesRouter.delete("/:id", authMiddleware, requirePermission(PERMISSIONS.CATALOG_MANAGE), GameImageController.remove);

export default gameImagesRouter;
