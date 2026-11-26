import { AppError } from "../utils/app-error";
import { log, requestContext } from "../utils/logger";

export type Payment = {
  id: string; reference: string; status: string; amountCents: number; currency: string;
};

export async function requestPaymentService<T>(path: string, body?: unknown): Promise<T> {
  const secret = process.env.PAYMENTS_SERVICE_SECRET ?? "";
  const startedAt = Date.now();
  let statusCode: number | undefined;
  try {
    if (secret.length < 32) throw new Error("Serviço não configurado");
    const serviceUrl = (process.env.PAYMENTS_SERVICE_URL ?? "http://localhost:3002").replace(/\/+$/, "");
    const response = await fetch(`${serviceUrl}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json", ...(requestContext.getStore() ? { "X-Nexus-Correlation-Id": requestContext.getStore()! } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000), redirect: "error",
    });
    statusCode = response.status;
    if (!response.ok) throw new Error("Serviço indisponível");
    log("info", "payment_service.request.completed", { statusCode, durationMs: Date.now() - startedAt });
    return await response.json() as T;
  } catch (error) {
    log("error", "payment_service.request.failed", { statusCode, durationMs: Date.now() - startedAt, errorName: error instanceof Error ? error.name : "UnknownError" });
    throw new AppError(503, "PAYMENT_UNAVAILABLE", "O serviço de pagamento demorou para responder. Tente novamente.");
  }
}
