import { RequestHandler } from "express";
import { recordHttpRequest } from "../services/http-metrics.service";

export const HTTP_METRICS_PATH = "/internal/metrics";

export const httpMetricsMiddleware: RequestHandler = (request, response, next) => {
  const startedAt = process.hrtime.bigint();

  response.once("finish", () => {
    if (request.method === "GET" && request.path === HTTP_METRICS_PATH) return;

    const elapsedNanoseconds = process.hrtime.bigint() - startedAt;
    const routePath = typeof request.route?.path === "string" ? request.route.path : "unmatched";
    const route = request.baseUrl ? `${request.baseUrl}${routePath}` : routePath;

    recordHttpRequest({
      method: request.method,
      route,
      statusCode: response.statusCode,
      durationMs: Number(elapsedNanoseconds) / 1_000_000,
    });
  });

  next();
};
