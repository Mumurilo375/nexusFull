import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const categoriesRouter = Router();

categoriesRouter.get("/", authMiddleware, CategoryController.list);
categoriesRouter.post("/", authMiddleware, requirePermission(PERMISSIONS.CATALOG_MANAGE), CategoryController.create);
categoriesRouter.get("/:id", authMiddleware, CategoryController.get);
categoriesRouter.put("/:id", authMiddleware, requirePermission(PERMISSIONS.CATALOG_MANAGE), CategoryController.update);
categoriesRouter.delete("/:id", authMiddleware, requirePermission(PERMISSIONS.CATALOG_MANAGE), CategoryController.remove);

export default categoriesRouter;
