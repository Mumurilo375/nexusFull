import { createPreference } from "./mercadopago";

type Checkout = Parameters<typeof createPreference>[0];
const isUuid = (value: string) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);

async function requestBackend(reference: string, method: "GET" | "POST", body?: object) {
  const secret = process.env.PAYMENTS_SERVICE_SECRET ?? "";
  if (secret.length < 32) throw new Error("Configure o segredo interno de pagamentos.");
  const backend = (process.env.BACKEND_INTERNAL_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  return fetch(`${backend}/internal/payments/checkouts/${reference}`, {
    method,
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
}

export async function prepareCheckout(reference: string): Promise<string | null> {
  if (!isUuid(reference)) throw new Error("Referência inválida.");
  const response = await requestBackend(reference, "GET");
  if (!response.ok) throw new Error("Backend indisponível para preparar o pagamento.");
  const { checkout } = await response.json() as { checkout: Checkout | null };
  if (!checkout) return null;

  const expiresAt = Date.parse(checkout.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  if (!Number.isSafeInteger(checkout.orderId) || checkout.orderId <= 0 ||
      !Number.isSafeInteger(checkout.amountCents) || checkout.amountCents <= 0 ||
      checkout.reference !== reference || !checkout.orderNumber || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    throw new Error("Dados do pedido inválidos.");
  }

  const checkoutUrl = await createPreference(checkout);
  const saved = await requestBackend(reference, "POST", { checkoutUrl });
  if (!saved.ok) throw new Error("Backend indisponível para preparar o pagamento.");
  return checkoutUrl;
}
