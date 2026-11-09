import express, { ErrorRequestHandler, RequestHandler } from "express";
import {
  createPreference,
  getPayment,
  listPayments,
  secureEqual,
  updatePayment,
  verifyWebhook,
} from "./mercadopago";

const app = express();
const isUuid = (value: string) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

const requireBackend: RequestHandler = (req, res, next) => {
  const secret = process.env.PAYMENTS_SERVICE_SECRET ?? "";
  if (secret.length < 32) return res.sendStatus(503);

  const authorization = req.get("authorization") ?? "";
  if (!secureEqual(authorization, `Bearer ${secret}`)) return res.sendStatus(401);
  next();
};

async function handleWebhook(req: express.Request, res: express.Response) {
  const paymentId = String(req.query["data.id"] ?? "");
  const validSignature = verifyWebhook(
    req.get("x-signature") ?? "",
    req.get("x-request-id") ?? "",
    paymentId,
    process.env.MERCADO_PAGO_WEBHOOK_SECRET ?? "",
  );

  if (!validSignature) return res.sendStatus(401);
  if (req.body?.type !== "payment") return res.sendStatus(200);

  const payment = await getPayment(paymentId);
  if (!isUuid(payment.reference)) return res.sendStatus(200);

  const backendUrl = process.env.BACKEND_INTERNAL_URL;
  const serviceSecret = process.env.PAYMENTS_SERVICE_SECRET;
  const response = await fetch(`${backendUrl}/internal/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment),
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });

  if (!response.ok) throw new Error("Confirmação do pedido indisponível.");
  res.sendStatus(200);
}

async function createCheckout(req: express.Request, res: express.Response) {
  const { reference, orderNumber, orderId, amountCents, expiresAt } = req.body ?? {};
  const validOrder = Number.isSafeInteger(orderId) && orderId > 0;
  const validAmount = Number.isSafeInteger(amountCents) && amountCents > 0 && amountCents <= 9999999999;
  const validExpiration = typeof expiresAt === "string" && Date.parse(expiresAt) > Date.now();

  if (!isUuid(reference) || !validOrder || !validAmount ||
      typeof orderNumber !== "string" || orderNumber.length > 50 || !validExpiration) {
    return res.sendStatus(400);
  }

  if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    throw new Error("Configure a assinatura do webhook.");
  }

  const checkoutUrl = await createPreference({
    reference,
    orderNumber,
    orderId,
    amountCents,
    expiresAt,
  });
  res.status(201).json({ checkoutUrl });
}

async function changePayment(req: express.Request, res: express.Response) {
  const id = String(req.params.id);
  const action = String(req.params.action);
  if (!/^\d+$/.test(id) || !["refund", "cancel"].includes(action)) {
    return res.sendStatus(400);
  }

  if (action === "refund") {
    const payment = await getPayment(id);
    if (payment.status !== "refunded") {
      await updatePayment(`/v1/payments/${id}/refunds`, "POST", {}, `refund-${id}`);
    }
  } else {
    await updatePayment(`/v1/payments/${id}`, "PUT", { status: "cancelled" });
  }

  res.json(await getPayment(id));
}

app.get("/health", (_req, res) => res.json({ status: "healthy" }));
app.post("/payments", requireBackend, createCheckout);
app.get("/payments/:reference", requireBackend, async (req, res) => {
  const reference = String(req.params.reference);
  if (!isUuid(reference)) return res.sendStatus(400);
  res.json(await listPayments(reference));
});
app.post("/payments/:id/:action", requireBackend, changePayment);
app.post("/webhooks/mercadopago", handleWebhook);

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(
    "Falha no serviço de pagamentos:",
    error instanceof Error ? error.message : "Erro desconhecido",
  );
  const status = error?.type === "entity.too.large" ? 413 : 502;
  res.status(status).json({
    message: "Não foi possível processar o pagamento. Tente novamente em instantes.",
  });
};

app.use(handleError);
export default app;
