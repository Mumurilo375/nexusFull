import { Router } from "express";
import ListingController from "../controllers/listing.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const manageCatalog = requirePermission(PERMISSIONS.CATALOG_MANAGE);

const listingsRouter = Router();

listingsRouter.get("/", ListingController.list);
listingsRouter.get("/:id/stock", ListingController.stock);
listingsRouter.get("/:id/details", ListingController.details);
listingsRouter.get("/:id", ListingController.get);
listingsRouter.post(
  "/",
  authMiddleware,
  manageCatalog,
  ListingController.create,
);
listingsRouter.put(
  "/:id",
  authMiddleware,
  manageCatalog,
  ListingController.update,
);
listingsRouter.delete(
  "/:id",
  authMiddleware,
  manageCatalog,
  ListingController.remove,
);

export default listingsRouter;
