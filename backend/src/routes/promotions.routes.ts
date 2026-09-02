import { Router } from "express";
import PromotionController from "../controllers/promotion.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { promotionMediaFields } from "../middlewares/image-upload.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const managePromotions = requirePermission(PERMISSIONS.PROMOTIONS_MANAGE);

const promotionsRouter = Router();

promotionsRouter.get("/", PromotionController.list);
promotionsRouter.get("/:id", PromotionController.get);
promotionsRouter.post("/", authMiddleware, managePromotions, promotionMediaFields, PromotionController.create);
promotionsRouter.put("/:id", authMiddleware, managePromotions, promotionMediaFields, PromotionController.update);
promotionsRouter.delete("/:id", authMiddleware, managePromotions, PromotionController.remove);
promotionsRouter.post("/:id/listings/:listingId", authMiddleware, managePromotions, PromotionController.addListing);
promotionsRouter.delete("/:id/listings/:listingId", authMiddleware, managePromotions, PromotionController.removeListing);

export default promotionsRouter;
