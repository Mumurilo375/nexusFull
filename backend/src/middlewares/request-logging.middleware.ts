import { randomUUID } from "node:crypto";
import { RequestHandler } from "express";
import { log } from "../utils/logger";

export const requestLoggingMiddleware: RequestHandler = (req, res, next) => {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();
  const path = req.originalUrl.split("?", 1)[0];
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    if (path === "/health" && res.statusCode < 400) return;
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    log(level, "http.request.completed", {
      requestId,
      method: req.method,
      path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });

  next();
};
