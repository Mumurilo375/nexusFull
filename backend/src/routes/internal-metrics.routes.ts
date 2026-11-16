import { Router } from "express";
import { cronMiddleware } from "../middlewares/cron.middleware";
import { getHttpMetricsSummary } from "../services/http-metrics.service";

const router = Router();

router.get("/internal/metrics", cronMiddleware, (_request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.json(getHttpMetricsSummary());
});

export default router;
