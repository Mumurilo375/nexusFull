import { createClient } from "redis";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/database";
import GamePlatformListing from "../models/GamePlatformListing";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Platform from "../models/Platform";
import Promotion from "../models/Promotion";
import PromotionListing from "../models/PromotionListing";
import Users from "../models/Users";
import Wishlist from "../models/Wishlist";
import Games from "../models/Games";
import { log } from "../utils/logger";
import { buildPricing, toNumber } from "../utils/money";

export const EMAIL_CHANNEL = "nexus:emails";
export const EMAIL_ACCEPTED_CHANNEL = "nexus:emails:accepted";
type EmailEvent = Record<string, unknown> & { notificationId: string; type: string; to: string };
type EmailAcknowledgement = { notificationId: string; status: "accepted" | "failed"; providerEmailId?: string; errorName?: string };
type PendingAcknowledgement = { resolve: () => void; reject: (error: Error) => void; timer: NodeJS.Timeout };
let publisher: ReturnType<typeof createClient> | null = null;
let publisherReady: Promise<void> | null = null;
const pendingAcknowledgements = new Map<string, PendingAcknowledgement>();
const inFlightNotifications = new Map<string, Promise<void>>();

function handleAcknowledgement(message: string) {
  let acknowledgement: EmailAcknowledgement;
  try { acknowledgement = JSON.parse(message) as EmailAcknowledgement; }
  catch { return; }
  if (!acknowledgement.notificationId) return;
  const pending = pendingAcknowledgements.get(acknowledgement.notificationId);
  if (!pending) return;
  clearTimeout(pending.timer);
  pendingAcknowledgements.delete(acknowledgement.notificationId);
  if (acknowledgement.status === "accepted") pending.resolve();
  else pending.reject(new Error(`O provedor não aceitou a notificação (${acknowledgement.errorName ?? "erro desconhecido"}).`));
}

async function initializePublisher() {
  if (!process.env.REDIS_URL) throw new Error("Configure REDIS_URL.");
  publisher = createClient({ url: process.env.REDIS_URL });
  publisher.on("error", () => undefined);
  await publisher.connect();

  const acknowledgements = publisher.duplicate();
  acknowledgements.on("error", () => undefined);
  await acknowledgements.connect();
  await acknowledgements.subscribe(EMAIL_ACCEPTED_CHANNEL, handleAcknowledgement);
}

async function getPublisher() {
  if (!publisherReady) publisherReady = initializePublisher();
  await publisherReady;
  return publisher!;
}

function waitForAcceptance(notificationId: string) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingAcknowledgements.delete(notificationId);
      reject(new Error("O serviço de email não confirmou a aceitação da notificação a tempo."));
    }, 15_000);
    pendingAcknowledgements.set(notificationId, { resolve, reject, timer });
  });
}

async function publishEmail(event: EmailEvent) {
  const receipts = await sequelize.query<{ notification_id: string }>(
    "SELECT notification_id FROM email_delivery_receipts WHERE notification_id = :id",
    { replacements: { id: event.notificationId }, type: QueryTypes.SELECT },
  );
  if (receipts.length) return;
  const existing = inFlightNotifications.get(event.notificationId);
  if (existing) return existing;

  const delivery = Promise.resolve().then(async () => {
    const client = await getPublisher();
    const accepted = waitForAcceptance(event.notificationId);
    void accepted.catch(() => undefined);
    try {
      const subscribers = await client.publish(EMAIL_CHANNEL, JSON.stringify(event));
      if (subscribers === 0) throw new Error("Nenhum serviço de email está inscrito no canal.");
      await accepted;
      await sequelize.query(
        "INSERT INTO email_delivery_receipts (notification_id) VALUES (:id) ON CONFLICT (notification_id) DO NOTHING",
        { replacements: { id: event.notificationId } },
      );
    } catch (error) {
      const pending = pendingAcknowledgements.get(event.notificationId);
      if (pending) {
        clearTimeout(pending.timer);
        pendingAcknowledgements.delete(event.notificationId);
      }
      throw error;
    }
  });
  inFlightNotifications.set(event.notificationId, delivery);
  try { await delivery; }
  finally { inFlightNotifications.delete(event.notificationId); }
}

export async function publishOrderPaidEmail(orderId: number) {
  const order = await Order.findByPk(orderId, {
    include: [{ model: Users, as: "user", attributes: ["email", "username"] }],
  });
  const user = order?.get("user") as Users | undefined;
  if (!order || !user?.email) return;
  const items = await OrderItem.findAll({
    where: { orderId: order.id },
    include: [{
      model: GamePlatformListing,
      as: "listing",
      attributes: ["id"],
      include: [
        { model: Games, as: "game", attributes: ["title"] },
        { model: Platform, as: "platform", attributes: ["name"] },
      ],
    }],
    order: [["id", "ASC"]],
  });
  const groupedItems = new Map<number, { gameTitle: string; platformName: string; quantity: number; unitPrice: number }>();
  for (const item of items) {
    const listing = item.get("listing") as (GamePlatformListing & { game?: Games; platform?: Platform }) | undefined;
    if (!listing) continue;
    const existing = groupedItems.get(listing.id);
    if (existing) existing.quantity += 1;
    else groupedItems.set(listing.id, {
      gameTitle: listing.game?.title ?? "Jogo",
      platformName: listing.platform?.name ?? "Plataforma",
      quantity: 1,
      unitPrice: toNumber(item.price),
    });
  }
  await publishEmail({
    notificationId: `order-paid-${order.id}`, type: "order.paid", to: user.email,
    username: user.username, orderNumber: order.orderNumber,
    confirmedAt: order.paymentConfirmedAt?.toISOString() ?? new Date().toISOString(),
    paymentMethod: order.paymentMethod,
    subtotal: toNumber(order.subtotal), discountAmount: toNumber(order.discountAmount),
    totalAmount: toNumber(order.totalAmount), items: [...groupedItems.values()],
  });
}

async function publishPromotionEmails(promotion: Promotion) {
  const testRecipient = process.env.RESEND_TEST_RECIPIENT?.trim().toLowerCase();
  if ((process.env.RESEND_FROM ?? "").toLowerCase().includes("onboarding@resend.dev") && !testRecipient) {
    throw new Error("Configure RESEND_TEST_RECIPIENT para o modo de teste do Resend.");
  }
  const isEligible = (email: string) => !testRecipient || email.trim().toLowerCase() === testRecipient;
  let failed = false;
  async function send(event: EmailEvent) {
    if (!isEligible(event.to)) return;
    try { await publishEmail(event); }
    catch (error) {
      failed = true;
      log("error", "promotion.email_delivery_failed", {
        promotionId: promotion.id, notificationId: event.notificationId,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  const links = await PromotionListing.findAll({
    where: { promotionId: promotion.id },
    include: [{
      model: GamePlatformListing,
      as: "listing",
      attributes: ["id", "gameId", "price"],
      include: [
        { model: Games, as: "game", attributes: ["title"] },
        { model: Platform, as: "platform", attributes: ["name"] },
      ],
    }],
    order: [[{ model: GamePlatformListing, as: "listing" }, "id", "ASC"]],
  });
  const promotionItems = links.flatMap((link) => {
    const listing = link.get("listing") as (GamePlatformListing & { game?: Games; platform?: Platform }) | undefined;
    if (!listing) return [];
    return [{ gameTitle: listing.game?.title ?? "Jogo", platformName: listing.platform?.name ?? "Plataforma" }];
  });
  const subscribers = await Users.findAll({ where: { receiveOffers: true }, attributes: ["id", "email", "username"] });
  for (const user of subscribers) await send({
    notificationId: `offer-started-${promotion.id}-${user.id}`,
    type: "offer.started", to: user.email, username: user.username,
    promotionId: promotion.id, promotionCoverImageUrl: promotion.bannerImageUrl ?? promotion.coverImageUrl,
    promotionName: promotion.name, promotionDescription: promotion.description,
    discount: promotion.discountPercentage, startDate: promotion.startDate.toISOString(),
    endDate: promotion.endDate.toISOString(), items: promotionItems,
  });

  const promotedListings = links.flatMap((link) => {
    const listing = link.get("listing") as (GamePlatformListing & { game?: Games; platform?: Platform }) | undefined;
    if (!listing) return [];
    const pricing = buildPricing(listing.price, promotion.discountPercentage);
    return [{ gameId: listing.gameId, gameTitle: listing.game?.title ?? "Jogo", platformName: listing.platform?.name ?? "Plataforma", basePrice: pricing.basePrice, discountedPrice: pricing.finalPrice }];
  });
  const gameIds = [...new Set(promotedListings.map((listing) => listing.gameId))];
  if (!gameIds.length) {
    if (failed) throw new Error("Não foi possível enviar todas as notificações.");
    return !testRecipient;
  }
  const wishlists = await Wishlist.findAll({
    where: { gameId: { [Op.in]: gameIds } },
    include: [{ model: Users, as: "user", where: { receiveOffers: true }, attributes: ["email", "username"] },
      { association: "game", attributes: ["title"] }],
  });
  for (const item of wishlists) {
    const user = item.get("user") as Users;
    const wishlistGame = item.get("game") as Games;
    const gameListings = promotedListings.filter((listing) => listing.gameId === item.gameId);
    await send({ notificationId: `wishlist-discount-${promotion.id}-${item.userId}-${item.gameId}`,
      type: "wishlist.discount", to: user.email, username: user.username,
      promotionId: promotion.id, promotionCoverImageUrl: promotion.bannerImageUrl ?? promotion.coverImageUrl,
      gameTitle: wishlistGame.title, promotionName: promotion.name, discount: promotion.discountPercentage,
      items: gameListings.map(({ platformName, basePrice, discountedPrice }) => ({ platformName, basePrice, discountedPrice })) });
  }
  if (failed) throw new Error("Não foi possível enviar todas as notificações.");
  return !testRecipient;
}

async function announceStartedPromotions() {
  const promotions = await Promotion.findAll({
    where: { isActive: true, startDate: { [Op.lte]: new Date() }, endDate: { [Op.gt]: new Date() }, emailNotifiedAt: null },
  });
  for (const promotion of promotions) {
    try {
      const complete = await publishPromotionEmails(promotion);
      if (complete) {
        await promotion.update({ emailNotifiedAt: new Date() });
        log("info", "promotion.email_events_published", { promotionId: promotion.id });
      }
    } catch (error) {
      log("error", "promotion.email_scheduler_failed", {
        promotionId: promotion.id, errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }
  }
}

export function startPromotionEmailScheduler() {
  let running = false;
  const run = () => {
    if (running) return;
    running = true;
    void announceStartedPromotions()
      .catch((error) => {
        log("error", "promotion.email_scheduler_failed", { errorName: error instanceof Error ? error.name : "UnknownError" });
      })
      .finally(() => { running = false; });
  };
  run();
  return setInterval(run, 30_000);
}
