import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const categoriesRouter = Router();
categoriesRouter.use(authMiddleware);

categoriesRouter.get("/", CategoryController.list);
categoriesRouter.post("/", requirePermission(PERMISSIONS.CATALOG_MANAGE), CategoryController.create);
categoriesRouter.get("/:id", CategoryController.get);
categoriesRouter.put("/:id", requirePermission(PERMISSIONS.CATALOG_MANAGE), CategoryController.update);
categoriesRouter.delete("/:id", requirePermission(PERMISSIONS.CATALOG_MANAGE), CategoryController.remove);

export default categoriesRouter;
