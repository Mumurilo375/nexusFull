import { createHmac, timingSafeEqual } from "node:crypto";

const API_URL = "https://api.mercadopago.com";

export type Payment = {
  id: string;
  reference: string;
  status: string;
  amountCents: number;
  currency: string;
};

type PaymentResponse = {
  id: number;
  external_reference: string;
  status: string;
  transaction_amount: number;
  currency_id: string;
  live_mode: boolean;
};

type PreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  idempotencyKey?: string;
};

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Configure a variável ${name}.`);
  return value;
}

export function secureEqual(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export function verifyWebhook(
  signature: string,
  requestId: string,
  paymentId: string,
  secret: string,
): boolean {
  if (!secret || !requestId || !/^\d+$/.test(paymentId)) return false;

  const timestamp = signature.match(/(?:^|,)\s*ts=([^,]+)/)?.[1];
  const receivedHash = signature.match(/(?:^|,)\s*v1=([^,]+)/)?.[1];
  if (!timestamp || !receivedHash) return false;

  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest("hex");
  return secureEqual(receivedHash, expectedHash);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${requiredEnvironment("MERCADO_PAGO_ACCESS_TOKEN")}`,
    "Content-Type": "application/json",
  };

  if (options.idempotencyKey) headers["X-Idempotency-Key"] = options.idempotencyKey;

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });

  if (!response.ok) throw new Error(`Mercado Pago respondeu com HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

function normalizePayment(payment: PaymentResponse): Payment {
  const sandboxPayment = !payment.live_mode;
  const sandboxConfigured = process.env.MERCADO_PAGO_SANDBOX === "true";
  if (sandboxPayment !== sandboxConfigured) {
    throw new Error("O pagamento recebido pertence a outro ambiente do Mercado Pago.");
  }

  return {
    id: String(payment.id),
    reference: payment.external_reference,
    status: payment.status,
    amountCents: Math.round(payment.transaction_amount * 100),
    currency: payment.currency_id,
  };
}

export async function createPreference(input: {
  reference: string;
  orderNumber: string;
  orderId: number;
  amountCents: number;
  expiresAt: string;
}): Promise<string> {
  const returnUrl = new URL("/checkout", requiredEnvironment("PAYMENTS_RETURN_URL"));
  returnUrl.searchParams.set("orderId", String(input.orderId));

  const preference = await request<PreferenceResponse>("/checkout/preferences", {
    method: "POST",
    body: {
      items: [{
        id: String(input.orderId),
        title: `Pedido ${input.orderNumber}`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: input.amountCents / 100,
      }],
      external_reference: input.reference,
      notification_url: requiredEnvironment("MERCADO_PAGO_WEBHOOK_URL"),
      back_urls: {
        success: returnUrl.toString(),
        failure: returnUrl.toString(),
        pending: returnUrl.toString(),
      },
      auto_return: "approved",
      expires: true,
      expiration_date_to: input.expiresAt,
    },
  });

  const checkoutUrl = process.env.MERCADO_PAGO_SANDBOX === "true"
    ? preference.sandbox_init_point
    : preference.init_point;
  if (!checkoutUrl) throw new Error("Mercado Pago não retornou a URL de checkout.");
  return checkoutUrl;
}

export async function getPayment(id: string): Promise<Payment> {
  const payment = await request<PaymentResponse>(`/v1/payments/${encodeURIComponent(id)}`);
  return normalizePayment(payment);
}

export async function listPayments(reference: string): Promise<Payment[]> {
  const results: PaymentResponse[] = [];
  let offset = 0;
  let total = 1;

  while (offset < total) {
    const page = await request<{ results: PaymentResponse[]; paging: { total: number } }>(
      `/v1/payments/search?external_reference=${encodeURIComponent(reference)}&limit=50&offset=${offset}`,
    );
    results.push(...page.results);
    total = page.paging.total;
    offset += page.results.length;
    if (!page.results.length) break;
  }

  return results.filter((payment) => payment.external_reference === reference).map(normalizePayment);
}

export function updatePayment(
  path: string,
  method: "POST" | "PUT",
  body: unknown,
  idempotencyKey?: string,
): Promise<unknown> {
  return request(path, { method, body, idempotencyKey });
}
