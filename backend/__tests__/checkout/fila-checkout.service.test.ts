import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import Order from "../../src/models/Order";
import { enqueueCheckout } from "../../src/services/checkout-queue.service";

const xAdd = jest.fn<(...args: [string, string, { reference: string }]) => Promise<string>>();
const connect = jest.fn<() => Promise<void>>();
const redis = {
  isReady: false,
  on: jest.fn(),
  connect,
  xAdd,
};

jest.mock("redis", () => ({ createClient: () => redis }));

const order = {
  id: 42,
  status: "pending",
  checkoutUrl: null,
  paymentReference: "00b5e632-253b-4ff8-9926-dc88fa123456",
} as Order;

beforeEach(() => {
  process.env.REDIS_URL = "redis://fila-de-teste";
  redis.isReady = false;
  connect.mockReset();
  xAdd.mockReset();
  connect.mockImplementation(async () => { redis.isReady = true; });
  xAdd.mockResolvedValue("1-0");
});

describe("fila de preparação de pagamentos", () => {
  it("publica a referência do pedido no Redis", async () => {
    await enqueueCheckout(order);
    expect(xAdd).toHaveBeenCalledWith("nexus:payments:checkouts", "*", {
      reference: order.paymentReference!,
    });
  });

  it("não publica pedidos que não estão aguardando pagamento", async () => {
    await enqueueCheckout({ ...order, status: "paid" } as Order);
    expect(xAdd).not.toHaveBeenCalled();
  });

  it("devolve erro se a fila não estiver disponível", async () => {
    connect.mockRejectedValueOnce(new Error("offline"));
    await expect(enqueueCheckout(order)).rejects.toThrow("offline");
  });
});
