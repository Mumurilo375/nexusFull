import { Router } from "express";
import AdminOrderController from "../controllers/admin-order.controller";
import ListingPriceChangeController from "../controllers/listing-price-change.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const adminRouter = Router();

adminRouter.use(authMiddleware);

adminRouter.get("/orders", requirePermission(PERMISSIONS.ORDERS_READ), AdminOrderController.list);
adminRouter.get("/orders/:id", requirePermission(PERMISSIONS.ORDERS_READ), AdminOrderController.get);
adminRouter.get("/price-history", requirePermission(PERMISSIONS.PRICING_READ), ListingPriceChangeController.list);

export default adminRouter;
