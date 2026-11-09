const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createHmac } = require("node:crypto");
const app = require("../dist/app").default;
const { verifyWebhook } = require("../dist/mercadopago");

const realFetch = global.fetch;
const reference = "00b5e632-253b-4ff8-9926-dc88fa123456";
const secret = "segredo-de-teste-com-mais-de-32-caracteres";
const payment = { id: 123, external_reference: reference, status: "approved", transaction_amount: 50, currency_id: "BRL", live_mode: false };
let server, base, calls, provider, backendStatus;
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { global.fetch = realFetch; await new Promise((resolve) => server.close(resolve)); });
beforeEach(() => {
  Object.assign(process.env, {
    PAYMENTS_SERVICE_SECRET: secret, MERCADO_PAGO_WEBHOOK_SECRET: secret,
    MERCADO_PAGO_ACCESS_TOKEN: "token-apenas-para-testes", MERCADO_PAGO_SANDBOX: "true",
    BACKEND_INTERNAL_URL: "http://backend:3000", PAYMENTS_RETURN_URL: "https://nexus.store",
    MERCADO_PAGO_WEBHOOK_URL: "https://public.example/payments/webhook",
  });
  calls = []; backendStatus = 200; provider = payment;
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url === "http://backend:3000/internal/payments") return json({}, backendStatus);
    assert.ok(url.startsWith("https://api.mercadopago.com/"));
    if (url.endsWith("/checkout/preferences")) return json({ id: "pref", init_point: "https://www.mercadopago.com.br/live", sandbox_init_point: "https://sandbox.mercadopago.com.br/test" });
    if (url.includes("/search?")) return json({ results: [provider], paging: { total: 1 } });
    return json(provider);
  };
});

function request(path, body, authenticated = true) {
  return realFetch(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...(authenticated ? { Authorization: `Bearer ${secret}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
function webhook(signature, body = { type: "payment", data: { id: "999" } }) {
  return realFetch(`${base}/webhooks/mercadopago?data.id=123&type=payment`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-signature": signature, "x-request-id": "req-1" }, body: JSON.stringify(body),
  });
}
function signature() {
  return `ts=1742505638683,v1=${createHmac("sha256", secret).update("id:123;request-id:req-1;ts:1742505638683;").digest("hex")}`;
}

test("protege todas as operações internas com o segredo do serviço", async () => {
  assert.equal((await request(`/payments/${reference}`, undefined, false)).status, 401);
  assert.equal(calls.length, 0);
  process.env.PAYMENTS_SERVICE_SECRET = "";
  assert.equal((await request(`/payments/${reference}`)).status, 503);
});
test("cria checkout hospedado com valor, referência e prazo informados pelo backend", async () => {
  const response = await request("/payments", { reference, orderNumber: "NEX-1", orderId: 1, amountCents: 5000, expiresAt: new Date(Date.now() + 1800000).toISOString() });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).checkoutUrl, "https://sandbox.mercadopago.com.br/test");
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.items[0].unit_price, 50);
  assert.equal(body.external_reference, reference);
  assert.equal(body.back_urls.success, "https://nexus.store/checkout?orderId=1");
  assert.equal(body.expires, true);
  assert.equal(body.notification_url, process.env.MERCADO_PAGO_WEBHOOK_URL);
});
test("rejeita valores inválidos e referências que poderiam alterar a URL", async () => {
  for (const amountCents of [0, -1, 1.2, "5000"]) {
    assert.equal((await request("/payments", { reference, orderId: 1, orderNumber: "NEX", amountCents, expiresAt: new Date(Date.now() + 10000).toISOString() })).status, 400);
  }
  assert.equal((await request("/payments/invalid-reference")).status, 400);
  assert.equal(calls.length, 0);
});
test("recusa webhook com assinatura adulterada sem consultar o gateway", async () => {
  assert.equal((await webhook("ts=1,v1=invalid")).status, 401);
  assert.equal(verifyWebhook(signature(), "other-request", "123", secret), false);
  assert.equal(calls.length, 0);
});
test("consulta o ID assinado e envia apenas os dados conferidos ao backend", async () => {
  assert.equal((await webhook(signature())).status, 200);
  assert.equal(calls[0].url, "https://api.mercadopago.com/v1/payments/123");
  assert.deepEqual(JSON.parse(calls[1].options.body), { id: "123", reference, status: "approved", amountCents: 5000, currency: "BRL" });
});
test("solicita nova entrega da notificação se o backend estiver indisponível", async () => {
  backendStatus = 503;
  assert.equal((await webhook(signature())).status, 502);
});
test("impede pagamento de teste de confirmar pedido no ambiente real", async () => {
  process.env.MERCADO_PAGO_SANDBOX = "false";
  assert.equal((await webhook(signature())).status, 502);
  assert.equal(calls.length, 1);
});
test("consulta todos os pagamentos da referência para recuperar notificações perdidas", async () => {
  const response = await request(`/payments/${reference}`);
  assert.deepEqual(await response.json(), [{ id: "123", reference, status: "approved", amountCents: 5000, currency: "BRL" }]);
});
test("estorna com chave de idempotência e não repete um estorno concluído", async () => {
  assert.equal((await request("/payments/123/refund", {})).status, 200);
  const refund = calls.find((call) => call.url.endsWith("/refunds"));
  assert.equal(refund.options.headers["X-Idempotency-Key"], "refund-123");
  calls = []; provider = { ...payment, status: "refunded" };
  assert.equal((await request("/payments/123/refund", {})).status, 200);
  assert.equal(calls.some((call) => call.url.endsWith("/refunds")), false);
});
test("cancela uma cobrança pendente e devolve o estado atualizado", async () => {
  provider = { ...payment, status: "cancelled" };
  assert.equal((await request("/payments/123/cancel", {})).status, 200);
  assert.equal(calls[0].options.method, "PUT");
  assert.deepEqual(JSON.parse(calls[0].options.body), { status: "cancelled" });
});
