import express, { ErrorRequestHandler, RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { log, requestContext } from "./logger";
import {
  getPayment,
  listPayments,
  secureEqual,
  updatePayment,
  verifyWebhook,
} from "./mercadopago";
import { prepareCheckout } from "./checkout-preparation";

const app = express();
const isUuid = (value: string) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);

app.disable("x-powered-by");
app.use((req, res, next) => {
  const requestId = randomUUID();
  const incoming = req.get("x-nexus-correlation-id");
  const correlationId = incoming && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(incoming) ? incoming : requestId;
  const startedAt = process.hrtime.bigint();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Correlation-Id", correlationId);
  res.on("finish", () => {
    if (req.path === "/health" && res.statusCode < 400) return;
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    log(level, "http.request.completed", {
      requestId,
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });
  requestContext.run(correlationId, next);
});
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

  const backendUrl = (process.env.BACKEND_INTERNAL_URL ?? "").replace(/\/+$/, "");
  const serviceSecret = process.env.PAYMENTS_SERVICE_SECRET;
  const response = await fetch(`${backendUrl}/internal/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceSecret}`,
      "Content-Type": "application/json",
      ...(requestContext.getStore() ? { "X-Nexus-Correlation-Id": requestContext.getStore()! } : {}),
    },
    body: JSON.stringify(payment),
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });

  if (!response.ok) throw new Error("Confirmação do pedido indisponível.");
  res.sendStatus(200);
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
app.post("/checkouts", requireBackend, async (req, res) => {
  const reference = String(req.body?.reference ?? "");
  if (!isUuid(reference)) return res.sendStatus(400);
  const checkoutUrl = await prepareCheckout(reference);
  if (!checkoutUrl) return res.status(409).json({ message: "Este pedido não pode mais iniciar o pagamento." });
  res.status(200).json({ checkoutUrl });
});
app.get("/payments/:reference", requireBackend, async (req, res) => {
  const reference = String(req.params.reference);
  if (!isUuid(reference)) return res.sendStatus(400);
  res.json(await listPayments(reference));
});
app.post("/payments/:id/:action", requireBackend, changePayment);
app.post("/webhooks/mercadopago", handleWebhook);

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error?.type === "entity.too.large" ? 413 : 502;
  log("error", "payment.request.failed", {
    requestId: String(res.locals.requestId ?? "unknown"),
    statusCode: status,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  res.status(status).json({
    message: "Não foi possível processar o pagamento. Tente novamente em instantes.",
  });
};

app.use(handleError);
export default app;
