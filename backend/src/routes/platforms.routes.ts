import { Router } from "express";
import PlatformController from "../controllers/platform.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { platformIconUpload } from "../middlewares/image-upload.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const manageCatalog = requirePermission(PERMISSIONS.CATALOG_MANAGE);

const platformsRouter = Router();
platformsRouter.use(authMiddleware);

platformsRouter.get("/", PlatformController.list);
platformsRouter.post("/", manageCatalog, platformIconUpload, PlatformController.create);
platformsRouter.get("/:id", PlatformController.get);
platformsRouter.put("/:id", manageCatalog, platformIconUpload, PlatformController.update);
platformsRouter.delete("/:id", manageCatalog, PlatformController.remove);

export default platformsRouter;
