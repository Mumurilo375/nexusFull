import { Router } from "express";
import GameTagController from "../controllers/game-tag.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const gameTagsRouter = Router();

gameTagsRouter.get("/", GameTagController.list);
gameTagsRouter.post("/", authMiddleware, requirePermission(PERMISSIONS.CATALOG_MANAGE), GameTagController.create);
gameTagsRouter.delete("/:gameId/:tagId", authMiddleware, requirePermission(PERMISSIONS.CATALOG_MANAGE), GameTagController.remove);

export default gameTagsRouter;
