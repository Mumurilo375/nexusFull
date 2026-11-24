import { randomUUID } from "node:crypto";
import { createClient } from "redis";
import { createPreference } from "./mercadopago";

const STREAM = "nexus:payments:checkouts";
const GROUP = "payments";
const consumer = randomUUID();
type Redis = ReturnType<typeof createClient>;
type Checkout = Parameters<typeof createPreference>[0];

async function requestBackend(reference: string, checkoutUrl?: string) {
  const secret = process.env.PAYMENTS_SERVICE_SECRET ?? "";
  if (secret.length < 32) throw new Error("Configure o segredo interno de pagamentos.");
  const backend = (process.env.BACKEND_INTERNAL_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const response = await fetch(`${backend}/internal/payments/checkouts/${reference}`, {
    method: checkoutUrl ? "POST" : "GET",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: checkoutUrl ? JSON.stringify({ checkoutUrl }) : undefined,
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Backend indisponível para preparar o pagamento.");
  return checkoutUrl ? null : response.json() as Promise<{ checkout: Checkout | null }>;
}

export async function prepareCheckout(reference: string, redis: Redis) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(reference)) return;
  const result = await requestBackend(reference);
  const checkout = result?.checkout;
  if (!checkout || Date.parse(checkout.expiresAt) <= Date.now()) return;
  if (!Number.isSafeInteger(checkout.orderId) || checkout.orderId <= 0 ||
      !Number.isSafeInteger(checkout.amountCents) || checkout.amountCents <= 0 ||
      checkout.reference !== reference || !checkout.orderNumber || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    throw new Error("Dados do pedido inválidos.");
  }

  const key = `${STREAM}:url:${reference}`;
  const url = await redis.get(key) ?? await createPreference(checkout);
  await redis.set(key, url, { EX: 3600 });
  await requestBackend(reference, url);
}

export function startCheckoutWorker() {
  let redis: Redis | undefined;
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      if (!redis?.isReady) {
        if (!process.env.REDIS_URL) throw new Error("Configure REDIS_URL.");
        redis = createClient({ url: process.env.REDIS_URL });
        redis.on("error", () => undefined);
        await redis.connect();
      }
      try {
        await redis.xGroupCreate(STREAM, GROUP, "0", { MKSTREAM: true });
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) throw error;
      }

      const oldMessages = await redis.xAutoClaim(STREAM, GROUP, consumer, 10000, "0-0", { COUNT: 10 });
      const newMessages = await redis.xReadGroup(GROUP, consumer, { key: STREAM, id: ">" }, { COUNT: 10 });
      const messages = [...oldMessages.messages, ...(newMessages?.[0]?.messages ?? [])];

      for (const message of messages) {
        try {
          await prepareCheckout(message.message.reference, redis);
          await redis.multi().xAck(STREAM, GROUP, message.id).xDel(STREAM, message.id).exec();
        } catch {
          console.warn("O pagamento será tentado novamente.");
        }
      }
    } catch {
      console.warn("Fila de pagamentos indisponível; nova tentativa em 5 segundos.");
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void run(), 5000);
  void run();
  return () => {
    clearInterval(timer);
    if (redis?.isOpen) redis.destroy();
  };
}
