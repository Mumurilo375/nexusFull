import cors, { CorsOptions } from "cors";
import express from "express";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import routes from "./routes";
import { reconcile } from "./controllers/payment-reconciliation.controller";
import { cronMiddleware } from "./middlewares/cron.middleware";
import {
  getPublicStorageObjectUrl,
  getStorageRoot,
  hasSupabaseStorageConfigured,
} from "./utils/media-storage";
import { initializeBackendRuntime } from "./services/runtime.service";

const app = express();

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();

const corsOptions: CorsOptions = {
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
const initializeRuntime: express.RequestHandler = (_request, _response, next) => {
  void initializeBackendRuntime().then(() => next(), next);
};
app.get("/internal/jobs/payment-reconciliation", cronMiddleware, initializeRuntime, reconcile);
app.use(initializeRuntime);
app.use("/media", (request, response, next) => {
  try {
    if (!hasSupabaseStorageConfigured()) {
      next();
      return;
    }

    const rawObjectPath = request.path.replace(/^\/+/, "");
    let decodedSegments: string[];
    try {
      decodedSegments = rawObjectPath.split("/").map((segment) => decodeURIComponent(segment));
    } catch {
      response.sendStatus(404);
      return;
    }
    if (
      decodedSegments.length === 0 ||
      decodedSegments.some(
        (segment) =>
          !segment ||
          segment === "." ||
          segment === ".." ||
          /[\\/]/.test(segment),
      )
    ) {
      response.sendStatus(404);
      return;
    }

    response.redirect(302, getPublicStorageObjectUrl(decodedSegments.join("/")));
  } catch (error) {
    next(error);
  }
});
app.use("/media", express.static(getStorageRoot()));
app.use(routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
