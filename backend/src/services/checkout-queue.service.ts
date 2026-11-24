import { createClient } from "redis";
import Order from "../models/Order";

const STREAM = "nexus:payments:checkouts";
let client: ReturnType<typeof createClient> | undefined;
let connecting: Promise<ReturnType<typeof createClient>> | undefined;

async function getRedis() {
  if (client?.isReady) return client;
  if (connecting) return connecting;
  if (!process.env.REDIS_URL) throw new Error("Configure REDIS_URL.");

  client ??= createClient({ url: process.env.REDIS_URL });
  client.on("error", () => undefined);
  connecting = client.connect().then(() => client!);
  try {
    return await connecting;
  } finally {
    connecting = undefined;
  }
}

export async function enqueueCheckout(order: Order) {
  if (order.status !== "pending" || order.checkoutUrl || !order.paymentReference) return;
  const redis = await getRedis();
  await redis.xAdd(STREAM, "*", { reference: order.paymentReference });
}
