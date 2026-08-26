import { Router } from "express";
import UserController from "../controllers/user.controller";
import { requirePermission } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { userAvatarUpload } from "../middlewares/user-avatar-upload.middleware";
import { PERMISSIONS } from "../services/rbac.service";

const usersRouter = Router();

usersRouter.get("/", authMiddleware, requirePermission(PERMISSIONS.USERS_READ), UserController.list);
usersRouter.post("/", userAvatarUpload, UserController.create);

usersRouter.get("/:id", authMiddleware, UserController.get);

usersRouter.put("/:id", authMiddleware, userAvatarUpload, UserController.update);
usersRouter.delete("/:id", authMiddleware, UserController.remove);

export default usersRouter;
