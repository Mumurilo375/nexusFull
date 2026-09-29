import { Router } from "express";
import GameKeyController from "../controllers/game-key.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const gameKeysRouter = Router();

const inventoryPermission = requirePermission(PERMISSIONS.INVENTORY_MANAGE);
gameKeysRouter.use(authMiddleware, inventoryPermission);

gameKeysRouter.get("/", GameKeyController.list);
gameKeysRouter.post("/bulk", GameKeyController.bulkCreate);
gameKeysRouter.post("/bulk-delete", GameKeyController.bulkDelete);
gameKeysRouter.get("/:id", GameKeyController.get);
gameKeysRouter.post("/", GameKeyController.create);
gameKeysRouter.put("/:id", GameKeyController.update);
gameKeysRouter.delete("/:id", GameKeyController.remove);

export default gameKeysRouter;
