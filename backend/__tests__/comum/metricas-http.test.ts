import express from "express";
import { AddressInfo } from "node:net";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { httpMetricsMiddleware } from "../../src/middlewares/http-metrics.middleware";
import { getHttpMetricsSummary, recordHttpRequest, resetHttpMetrics, HTTP_METRICS_SAMPLE_LIMIT } from "../../src/services/http-metrics.service";
import internalMetricsRoutes from "../../src/routes/internal-metrics.routes";

describe("métricas HTTP", () => {
  const app = express();
  app.use(httpMetricsMiddleware);
  app.use(internalMetricsRoutes);
  app.get("/ok/:id", (_request, response) => response.json({ ok: true }));
  app.get("/erro", (_request, response) => response.sendStatus(503));

  let server: ReturnType<typeof app.listen>;
  let baseUrl = "";
  const originalCronSecret = process.env.CRON_SECRET;

  beforeAll(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(() => {
    resetHttpMetrics();
    process.env.CRON_SECRET = "segredo-de-teste-interno-com-mais-de-32-caracteres";
  });

  afterEach(() => {
    if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalCronSecret;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  it("conta requisições e respostas 5xx e calcula a taxa de erro", async () => {
    await fetch(`${baseUrl}/ok/123?token=nao-deve-ser-coletado`);
    await fetch(`${baseUrl}/erro`);

    expect(getHttpMetricsSummary()).toMatchObject({
      totalRequests: 2,
      totalServerErrors: 1,
      errorRate: 50,
      sampleCount: 2,
    });
  });

  it("calcula o p95 com a amostra mais recente", () => {
    for (let durationMs = 1; durationMs <= 20; durationMs += 1) {
      recordHttpRequest({ method: "GET", route: "/items/:id", statusCode: 200, durationMs });
    }

    expect(getHttpMetricsSummary().p95ResponseTimeMs).toBe(19);
  });

  it("limita o número de amostras sem perder os totais", () => {
    for (let index = 0; index < HTTP_METRICS_SAMPLE_LIMIT + 5; index += 1) {
      recordHttpRequest({ method: "GET", route: "/items/:id", statusCode: index === 0 ? 500 : 200, durationMs: index });
    }

    expect(getHttpMetricsSummary()).toMatchObject({
      totalRequests: HTTP_METRICS_SAMPLE_LIMIT + 5,
      totalServerErrors: 1,
      sampleCount: HTTP_METRICS_SAMPLE_LIMIT,
    });
  });

  it("protege o endpoint e não conta nem expõe dados da própria consulta", async () => {
    await fetch(`${baseUrl}/ok/987654?password=nao-deve-ser-coletada`);
    const unauthorized = await fetch(`${baseUrl}/internal/metrics`);
    expect(unauthorized.status).toBe(401);

    const response = await fetch(`${baseUrl}/internal/metrics`, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(Object.keys(body).sort()).toEqual([
      "errorRate", "p95ResponseTimeMs", "sampleCount", "totalRequests", "totalServerErrors",
    ]);
    expect(body).toMatchObject({ totalRequests: 1, totalServerErrors: 0, sampleCount: 1 });
    expect(JSON.stringify(body)).not.toMatch(/987654|password|nao-deve-ser-coletada|127\.0\.0\.1/);
  });
});
