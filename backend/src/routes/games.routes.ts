import { Router } from "express";
import GameController from "../controllers/game.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { gameMediaFields } from "../middlewares/game-media-upload.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const manageCatalog = requirePermission(PERMISSIONS.CATALOG_MANAGE);
const manageInventory = requirePermission(PERMISSIONS.INVENTORY_MANAGE);

const gamesRouter = Router();

gamesRouter.get("/", GameController.list);
gamesRouter.get("/:id/details", GameController.details);
gamesRouter.get(
  "/:id/platforms",
  authMiddleware,
  manageCatalog,
  GameController.platforms,
);
gamesRouter.get("/:id", GameController.get);

gamesRouter.post(
  "/",
  authMiddleware,
  manageCatalog,
  gameMediaFields,
  GameController.create,
);
gamesRouter.put(
  "/:id",
  authMiddleware,
  manageCatalog,
  gameMediaFields,
  GameController.update,
);
gamesRouter.put(
  "/:id/platforms/:platformId",
  authMiddleware,
  manageCatalog,
  GameController.updatePlatform,
);
gamesRouter.post(
  "/:id/platforms/:platformId/keys",
  authMiddleware,
  manageInventory,
  GameController.addPlatformKeys,
);
gamesRouter.delete("/:id", authMiddleware, manageCatalog, GameController.remove);

export default gamesRouter;
