import { AppError } from "../utils/app-error";

export type Payment = {
  id: string; reference: string; status: string; amountCents: number; currency: string;
};

export async function requestPaymentService<T>(path: string, body?: unknown): Promise<T> {
  const secret = process.env.PAYMENTS_SERVICE_SECRET ?? "";
  try {
    if (secret.length < 32) throw new Error("Serviço não configurado");
    const response = await fetch(`${process.env.PAYMENTS_SERVICE_URL ?? "http://localhost:3002"}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000), redirect: "error",
    });
    if (!response.ok) throw new Error("Serviço indisponível");
    return await response.json() as T;
  } catch {
    throw new AppError(503, "PAYMENT_UNAVAILABLE", "Payment service unavailable");
  }
}
