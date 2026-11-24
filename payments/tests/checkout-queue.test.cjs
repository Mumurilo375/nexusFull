const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { createClient } = require("redis");
const { prepareCheckout, startCheckoutWorker } = require("../dist/checkout-queue");

const realFetch = global.fetch;
const reference = randomUUID();
const url = "https://sandbox.mercadopago.com.br/checkout/test";
let checkout, cache, redis, creations, saved, failSave, failGateway;
const json = (body) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  Object.assign(process.env, { PAYMENTS_SERVICE_SECRET: "segredo-interno-apenas-para-testes-123456",
    BACKEND_INTERNAL_URL: "http://backend:3000", MERCADO_PAGO_ACCESS_TOKEN: "teste",
    MERCADO_PAGO_WEBHOOK_SECRET: "teste", MERCADO_PAGO_SANDBOX: "true",
    PAYMENTS_RETURN_URL: "https://nexus.store", MERCADO_PAGO_WEBHOOK_URL: "https://nexus.store/payments/webhook" });
  checkout = { reference, orderId: 1, orderNumber: "NEX-1", amountCents: 5000,
    expiresAt: new Date(Date.now() + 1800000).toISOString() };
  cache = new Map(); creations = 0; saved = []; failSave = false; failGateway = false;
  redis = { get: async (key) => cache.get(key) ?? null, set: async (key, value) => { cache.set(key, value); } };
  global.fetch = async (target, options) => {
    if (target.startsWith("http://backend:3000/internal/payments/checkouts/")) {
      if (options.method === "GET") return json({ checkout });
      if (failSave) throw new Error("backend offline");
      saved.push(JSON.parse(options.body).checkoutUrl);
      return new Response(null, { status: 204 });
    }
    assert.equal(target, "https://api.mercadopago.com/checkout/preferences");
    creations++;
    if (failGateway) throw new Error("gateway offline");
    return json({ id: "pref", sandbox_init_point: url });
  };
});
after(() => { global.fetch = realFetch; });

test("cria o checkout depois de consultar o pedido salvo e devolve a URL ao backend", async () => {
  await prepareCheckout(reference, redis);
  assert.equal(creations, 1);
  assert.deepEqual(saved, [url]);
});

test("reaproveita a URL se o backend cair depois da criação", async () => {
  failSave = true;
  await assert.rejects(prepareCheckout(reference, redis), /backend offline/);
  failSave = false;
  await prepareCheckout(reference, redis);
  assert.equal(creations, 1);
  assert.deepEqual(saved, [url]);
});

test("uma falha no gateway permite nova tentativa sem perder o pedido", async () => {
  failGateway = true;
  await assert.rejects(prepareCheckout(reference, redis));
  assert.equal(saved.length, 0);
  failGateway = false;
  await prepareCheckout(reference, redis);
  assert.deepEqual(saved, [url]);
});

test("ignora pedidos já preparados, pagos, cancelados ou expirados", async () => {
  checkout = null;
  await prepareCheckout(reference, redis);
  checkout = { reference, orderId: 1, orderNumber: "NEX", amountCents: 5000, expiresAt: new Date(0).toISOString() };
  await prepareCheckout(reference, redis);
  await prepareCheckout("../invalid", redis);
  assert.equal(creations, 0);
  assert.equal(saved.length, 0);
});

test("recupera no Redis real uma mensagem abandonada por outro consumidor", {
  skip: !process.env.QUEUE_TEST_REDIS_URL,
}, async () => {
  const target = new URL(process.env.QUEUE_TEST_REDIS_URL);
  assert.equal(target.hostname, "127.0.0.1");
  assert.equal(target.port, "56389");
  process.env.REDIS_URL = target.href;
  const client = createClient({ url: target.href });
  await client.connect();
  const stream = "nexus:payments:checkouts";
  let stop;
  try {
    try { await client.xGroupCreate(stream, "payments", "0", { MKSTREAM: true }); }
    catch (error) { if (!error.message.includes("BUSYGROUP")) throw error; }
    const id = await client.xAdd(stream, "*", { reference });
    await client.xReadGroup("payments", "worker-que-caiu", { key: stream, id: ">" }, { COUNT: 100 });
    await client.sendCommand(["XCLAIM", stream, "payments", "worker-que-caiu", "0", id, "IDLE", "61000"]);
    stop = startCheckoutWorker();
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      if (saved.length && !(await client.xRange(stream, id, id)).length) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.deepEqual(saved, [url]);
    assert.equal((await client.xRange(stream, id, id)).length, 0);
    assert.equal((await client.xPending(stream, "payments")).pending, 0);
  } finally {
    stop?.();
    await client.quit();
  }
});
