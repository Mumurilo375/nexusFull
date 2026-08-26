import { Router } from "express";
import PlatformController from "../controllers/platform.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { platformIconUpload } from "../middlewares/platform-icon-upload.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const manageCatalog = requirePermission(PERMISSIONS.CATALOG_MANAGE);

const platformsRouter = Router();

platformsRouter.get("/", authMiddleware, PlatformController.list);
platformsRouter.post("/", authMiddleware, manageCatalog, platformIconUpload, PlatformController.create);
platformsRouter.get("/:id", authMiddleware, PlatformController.get);
platformsRouter.put("/:id", authMiddleware, manageCatalog, platformIconUpload, PlatformController.update);
platformsRouter.delete("/:id", authMiddleware, manageCatalog, PlatformController.remove);

export default platformsRouter;
