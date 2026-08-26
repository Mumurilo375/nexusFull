import { Router } from "express";
import GameKeyController from "../controllers/game-key.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const gameKeysRouter = Router();

const inventoryPermission = requirePermission(PERMISSIONS.INVENTORY_MANAGE);

gameKeysRouter.get("/", authMiddleware, inventoryPermission, GameKeyController.list);
gameKeysRouter.post("/bulk", authMiddleware, inventoryPermission, GameKeyController.bulkCreate);
gameKeysRouter.post("/bulk-delete", authMiddleware, inventoryPermission, GameKeyController.bulkDelete);
gameKeysRouter.get("/:id", authMiddleware, inventoryPermission, GameKeyController.get);
gameKeysRouter.post("/", authMiddleware, inventoryPermission, GameKeyController.create);
gameKeysRouter.put("/:id", authMiddleware, inventoryPermission, GameKeyController.update);
gameKeysRouter.delete("/:id", authMiddleware, inventoryPermission, GameKeyController.remove);

export default gameKeysRouter;
