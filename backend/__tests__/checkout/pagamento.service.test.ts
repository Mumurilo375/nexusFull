import { afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { Sequelize } from "sequelize";
import sequelize from "../../src/config/database";
import "../../src/models/associations";
import Users from "../../src/models/Users";
import Games from "../../src/models/Games";
import Platform from "../../src/models/Platform";
import GamePlatformListing from "../../src/models/GamePlatformListing";
import GameKey from "../../src/models/GameKey";
import CartItem from "../../src/models/CartItem";
import Order from "../../src/models/Order";
import OrderItem from "../../src/models/OrderItem";
import DeliveredKey from "../../src/models/DeliveredKey";
import { checkoutUserCart, getCheckout } from "../../src/services/checkout.service";
import { failPendingOrder, processPayment, receivePayment, refreshOrderPayment } from "../../src/services/order-payment.service";
import { Payment, requestPaymentService } from "../../src/services/payment.service";
import { getUserOrderById } from "../../src/services/orders.service";
import { getUserOrderItemById } from "../../src/services/order-item.service";
import { updateGameKey, deleteGameKey, bulkDeleteGameKeys } from "../../src/services/game-key.service";
import { countAvailableGameKeys } from "../../src/utils/stock";
import app from "../../src/app";
import { generateToken } from "../../src/utils/jwt";

jest.mock("../../src/config/database", () => {
  const { Sequelize } = jest.requireActual<typeof import("sequelize")>("sequelize");
  const url = process.env.PAYMENT_TEST_DATABASE_URL;
  if (url && (new URL(url).hostname !== "127.0.0.1" || new URL(url).pathname !== "/nexus_payments_test")) {
    throw new Error("Use apenas o banco isolado nexus_payments_test em localhost.");
  }
  return { __esModule: true, default: url ? new Sequelize(url, { logging: false, define: { underscored: true } }) : new Sequelize({ dialect: "postgres", logging: false }) };
});
jest.mock("../../src/config/cache", () => ({ invalidateCatalogCache: jest.fn() }));
jest.mock("../../src/services/payment.service", () => ({ requestPaymentService: jest.fn() }));

const describeDatabase = process.env.PAYMENT_TEST_DATABASE_URL ? describe : describe.skip;
const request = jest.mocked(requestPaymentService);

async function fixture(quantity = 1) {
  const name = randomUUID();
  const user = await Users.create({ email: `${name}@example.test`, username: name, passwordHash: "hash-teste" });
  const game = await Games.create({ title: name, description: "Teste", longDescription: "Teste", releaseDate: "2026-01-01", coverImageUrl: "/test.png" });
  const platform = await Platform.create({ name, slug: name });
  const listing = await GamePlatformListing.create({ gameId: game.id, platformId: platform.id, price: 50, isActive: true });
  const keys = await GameKey.bulkCreate(Array.from({ length: quantity }, () => ({ listingId: listing.id, keyValue: randomUUID(), status: "available" })));
  await CartItem.create({ userId: user.id, listingId: listing.id, quantity });
  return { user, listing, keys };
}

async function pending(quantity = 1) {
  const data = await fixture(quantity);
  const result = await checkoutUserCart(data.user.id);
  const order = (await Order.findByPk(result.order.id))!;
  const payment: Payment = { id: String(order.id + 100000), reference: order.paymentReference!, status: "approved", amountCents: quantity * 5000, currency: "BRL" };
  return { ...data, order, payment };
}

describeDatabase("pagamentos com PostgreSQL isolado", () => {
  beforeEach(() => {
    request.mockReset();
    request.mockResolvedValue({ checkoutUrl: "https://sandbox.mercadopago.com.br/checkout/test" });
  });
  afterAll(async () => { await sequelize.close(); });

  it("reserva sem entregar nem expor a key por pedidos ou itens", async () => {
    const { order, user, keys } = await pending(2);
    expect(order.status).toBe("pending");
    expect(await countAvailableGameKeys(keys[0].listingId)).toBe(0);
    expect(await DeliveredKey.count({ where: { userId: user.id } })).toBe(0);
    const details = await getUserOrderById(user.id, order.id);
    expect(JSON.stringify(details)).not.toContain(keys[0].keyValue);
    const item = (await OrderItem.findOne({ where: { orderId: order.id } }))!;
    expect(JSON.stringify(await getUserOrderItemById(user.id, item.id))).not.toContain(keys[0].keyValue);
  });

  it("confirma uma única vez mesmo recebendo callbacks concorrentes", async () => {
    const { order, user, payment, keys } = await pending(2);
    await Promise.all([processPayment(payment), processPayment(payment)]);
    expect((await order.reload()).status).toBe("paid");
    expect(await DeliveredKey.count({ where: { userId: user.id } })).toBe(2);
    expect(await CartItem.count({ where: { userId: user.id } })).toBe(0);
    expect((await keys[0].reload()).status).toBe("sold");
    expect(JSON.stringify(await getUserOrderById(user.id, order.id))).toContain(keys[0].keyValue);
  });

  it("libera e desvincula a reserva ao falhar, preservando o carrinho", async () => {
    const { order, user, keys } = await pending();
    await failPendingOrder(order.id);
    expect((await order.reload()).status).toBe("failed");
    expect((await keys[0].reload()).status).toBe("available");
    expect(await countAvailableGameKeys(keys[0].listingId)).toBe(1);
    expect((await OrderItem.findOne({ where: { orderId: order.id } }))!.gameKeyId).toBeNull();
    expect(await CartItem.count({ where: { userId: user.id } })).toBe(1);
    await checkoutUserCart(user.id);
  });

  it("estorna aprovação tardia sem entregar uma chave liberada", async () => {
    const { order, user, payment } = await pending();
    await failPendingOrder(order.id);
    await processPayment(payment);
    expect(request).toHaveBeenCalledWith(`/payments/${payment.id}/refund`, {});
    expect(await DeliveredKey.count({ where: { userId: user.id } })).toBe(0);
  });

  it.each([{ amountCents: 1 }, { currency: "USD" }])("estorna pagamento com valor ou moeda diferente: %j", async (invalid) => {
    const { user, payment } = await pending();
    await processPayment({ ...payment, ...invalid });
    expect(request).toHaveBeenCalledWith(`/payments/${payment.id}/refund`, {});
    expect(await DeliveredKey.count({ where: { userId: user.id } })).toBe(0);
  });

  it("estorna uma segunda cobrança sem duplicar a entrega", async () => {
    const { payment, user } = await pending();
    await processPayment(payment);
    await processPayment({ ...payment, id: `${payment.id}1` });
    expect(request).toHaveBeenLastCalledWith(`/payments/${payment.id}1/refund`, {});
    expect(await DeliveredKey.count({ where: { userId: user.id } })).toBe(1);
  });

  it("recupera confirmação sem webhook e preserva quantidades alteradas", async () => {
    const { order, user, payment } = await pending();
    await CartItem.update({ quantity: 2 }, { where: { userId: user.id } });
    request.mockResolvedValue([payment]);
    await refreshOrderPayment(order);
    expect(order.status).toBe("paid");
    expect((await CartItem.findOne({ where: { userId: user.id } }))!.quantity).toBe(2);
  });

  it("vence a reserva sem pagamento e mantém a reserva se o gateway cair", async () => {
    const { order, keys } = await pending();
    await order.update({ paymentExpiresAt: new Date(0) });
    request.mockRejectedValueOnce(new Error("offline"));
    await expect(refreshOrderPayment(order)).rejects.toThrow("offline");
    expect((await keys[0].reload()).status).toBe("reserved");
    request.mockResolvedValue([]);
    await refreshOrderPayment(order);
    expect((await keys[0].reload()).status).toBe("available");
  });

  it("cancela cobrança pendente antes de liberar a reserva vencida", async () => {
    const { order, payment, keys } = await pending();
    await order.update({ paymentExpiresAt: new Date(0) });
    request.mockResolvedValueOnce([{ ...payment, status: "pending" }])
      .mockResolvedValueOnce({ ...payment, status: "cancelled" });
    await refreshOrderPayment(order);
    expect(request).toHaveBeenLastCalledWith(`/payments/${payment.id}/cancel`, {});
    expect((await keys[0].reload()).status).toBe("reserved");
    request.mockResolvedValue([{ ...payment, status: "cancelled" }]);
    await refreshOrderPayment(order);
    expect((await keys[0].reload()).status).toBe("available");
  });

  it("encerra uma recusa e nunca libera uma key já vendida após estorno", async () => {
    const rejected = await pending();
    request.mockResolvedValue([{ ...rejected.payment, status: "rejected" }]);
    await receivePayment({ ...rejected.payment, status: "rejected" });
    expect((await rejected.order.reload()).status).toBe("failed");
    request.mockResolvedValue({ checkoutUrl: "https://sandbox.mercadopago.com.br/checkout/test" });
    const paid = await pending();
    await processPayment(paid.payment);
    await processPayment({ ...paid.payment, status: "refunded" });
    expect((await paid.order.reload()).status).toBe("failed");
    expect((await paid.keys[0].reload()).status).toBe("sold");
  });

  it("reutiliza o mesmo pedido em cliques simultâneos", async () => {
    const { user } = await fixture();
    const results = await Promise.all([checkoutUserCart(user.id), checkoutUserCart(user.id)]);
    expect(results[0].order.id).toBe(results[1].order.id);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("impede duas compras da última key por usuários diferentes", async () => {
    const { user, listing } = await fixture();
    const name = randomUUID();
    const other = await Users.create({ email: `${name}@test.local`, username: name, passwordHash: "teste" });
    await CartItem.create({ userId: other.id, listingId: listing.id, quantity: 1 });
    const results = await Promise.allSettled([checkoutUserCart(user.id), checkoutUserCart(other.id)]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
  });

  it("falha sem vender quando o microserviço não responde", async () => {
    const { user, keys } = await fixture();
    request.mockRejectedValue(new Error("offline"));
    await expect(checkoutUserCart(user.id)).rejects.toThrow("offline");
    expect((await keys[0].reload()).status).toBe("available");
    expect(await DeliveredKey.count({ where: { userId: user.id } })).toBe(0);
  });

  it("impede consultar checkout alheio e editar ou remover keys reservadas", async () => {
    const { order, user, keys } = await pending();
    await expect(getCheckout(user.id + 100000, order.id)).rejects.toMatchObject({ statusCode: 404 });
    await expect(updateGameKey(keys[0].id, { status: "available" })).rejects.toMatchObject({ statusCode: 409 });
    await expect(deleteGameKey(keys[0].id)).rejects.toMatchObject({ statusCode: 409 });
    await expect(bulkDeleteGameKeys({ ids: [keys[0].id], listingId: keys[0].listingId })).rejects.toThrow();
  });

  it("exige sessão no checkout e segredo interno para confirmar pagamentos", async () => {
    const { order, user, payment } = await pending();
    process.env.JWT_SECRET = "segredo-jwt-apenas-para-testes";
    process.env.PAYMENTS_SERVICE_SECRET = "segredo-interno-de-pagamentos-para-testes";
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const token = generateToken({ id: user.id, email: user.email });
    try {
      expect((await fetch(`${base}/checkout`, { method: "POST" })).status).toBe(401);
      expect((await fetch(`${base}/internal/payments`, { method: "POST" })).status).toBe(401);
      const response = await fetch(`${base}/checkout/${order.id}`, { headers: { Authorization: `Bearer ${token}` } });
      expect(response.status).toBe(200);
      expect((await response.json() as { order: { status: string } }).order.status).toBe("pending");
      expect((await fetch(`${base}/internal/payments`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payment),
      })).status).toBe(401);
      expect((await fetch(`${base}/internal/payments`, {
        method: "POST", headers: { Authorization: `Bearer ${process.env.PAYMENTS_SERVICE_SECRET}`, "Content-Type": "application/json" }, body: JSON.stringify(payment),
      })).status).toBe(200);
      expect((await order.reload()).status).toBe("paid");
    } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
  });

  it("reverte e reaplica a nova migration preservando pedidos existentes", async () => {
    const { user } = await fixture();
    const old = await Order.create({ userId: user.id, orderNumber: randomUUID(), status: "paid", paymentStatus: "succeeded", subtotal: 50, totalAmount: 50, paymentMethod: "card" });
    const migration = require("../../src/migrations/20261108090000-add-payment-checkout.js");
    await migration.down(sequelize.getQueryInterface());
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    expect((await old.reload()).status).toBe("paid");
  });
});
