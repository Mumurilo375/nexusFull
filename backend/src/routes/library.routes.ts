import { Router } from "express";
import LibraryController from "../controllers/library.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const libraryRouter = Router();
libraryRouter.use(authMiddleware);

libraryRouter.get("/keys", LibraryController.list);

export default libraryRouter;
