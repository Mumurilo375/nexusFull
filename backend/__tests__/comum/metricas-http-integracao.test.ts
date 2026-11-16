import express from "express";
import type { AddressInfo } from "node:net";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { httpMetricsMiddleware } from "../../src/middlewares/http-metrics.middleware";
import internalMetricsRoutes from "../../src/routes/internal-metrics.routes";
import { resetHttpMetrics } from "../../src/services/http-metrics.service";

const TEST_CRON_SECRET = "segredo-interno-de-teste-com-tamanho-superior-a-32-caracteres";

describe("integração HTTP das métricas", () => {
  const app = express();
  app.use(httpMetricsMiddleware);
  app.use(internalMetricsRoutes);
  app.get("/teste/ok/:id", (_request, response) => response.status(200).json({ status: "ok" }));
  app.get("/teste/erro", (_request, response) => response.sendStatus(500));

  let server: ReturnType<typeof app.listen> | undefined;
  let baseUrl = "";
  const originalCronSecret = process.env.CRON_SECRET;

  async function getMetrics(authorized = true) {
    const response = await fetch(`${baseUrl}/internal/metrics`, {
      headers: authorized ? { Authorization: `Bearer ${TEST_CRON_SECRET}` } : undefined,
    });
    const body = response.status === 200 ? await response.json() : null;
    return { response, body };
  }

  beforeAll(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server?.once("listening", resolve));
    const address = server?.address();
    if (!address || typeof address === "string") throw new Error("A porta de teste não foi disponibilizada.");
    baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
  });

  beforeEach(() => {
    resetHttpMetrics();
    process.env.CRON_SECRET = TEST_CRON_SECRET;
  });

  afterEach(() => {
    if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalCronSecret;
  });

  afterAll(async () => {
    if (!server) return;
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => error ? reject(error) : resolve());
    });
  });

  it("mede GET 200, HTTP 500 e 404 sem classificar 404 como erro de servidor", async () => {
    const success = await fetch(`${baseUrl}/teste/ok/42`);
    await success.arrayBuffer();
    const serverError = await fetch(`${baseUrl}/teste/erro`);
    await serverError.arrayBuffer();
    const notFound = await fetch(`${baseUrl}/rota-inexistente`);
    await notFound.arrayBuffer();

    const { body } = await getMetrics();
    expect(success.status).toBe(200);
    expect(serverError.status).toBe(500);
    expect(notFound.status).toBe(404);
    expect(body).toMatchObject({
      totalRequests: 3,
      totalServerErrors: 1,
      errorRate: expect.closeTo(100 / 3, 5),
      sampleCount: 3,
    });
    expect(body.p95ResponseTimeMs).toBeGreaterThan(0);
  });

  it("calcula p95 a partir das durações das requisições HTTP reais", async () => {
    for (let index = 0; index < 20; index += 1) {
      const response = await fetch(`${baseUrl}/teste/ok/${index}`);
      await response.arrayBuffer();
    }

    const { body } = await getMetrics();
    expect(body.sampleCount).toBe(20);
    expect(body.p95ResponseTimeMs).toBeGreaterThan(0);
    expect(Number.isFinite(body.p95ResponseTimeMs)).toBe(true);
  });

  it("mantém no máximo 1.000 amostras após mais de 1.000 requisições HTTP", async () => {
    const total = 1_005;
    for (let offset = 0; offset < total; offset += 100) {
      const batchSize = Math.min(100, total - offset);
      const responses = await Promise.all(
        Array.from({ length: batchSize }, (_, index) =>
          fetch(`${baseUrl}/teste/ok/${offset + index}`),
        ),
      );
      await Promise.all(responses.map((response) => response.arrayBuffer()));
    }

    const { body } = await getMetrics();
    expect(body.totalRequests).toBe(total);
    expect(body.sampleCount).toBe(1_000);
  });

  it("exige autenticação, exclui a própria consulta e retorna somente dados agregados", async () => {
    const safeRequest = await fetch(`${baseUrl}/teste/ok/identificador-privado?token=nao-expor`);
    await safeRequest.arrayBuffer();

    const unauthorized = await getMetrics(false);
    const firstQuery = await getMetrics();
    const secondQuery = await getMetrics();

    expect(unauthorized.response.status).toBe(401);
    expect(firstQuery.response.status).toBe(200);
    expect(secondQuery.body.totalRequests).toBe(1);
    expect(secondQuery.body.totalServerErrors).toBe(0);
    expect(Object.keys(secondQuery.body).sort()).toEqual([
      "errorRate", "p95ResponseTimeMs", "sampleCount", "totalRequests", "totalServerErrors",
    ]);
    expect(JSON.stringify(secondQuery.body)).not.toMatch(/identificador-privado|token|nao-expor|127\.0\.0\.1/);
  });
});
