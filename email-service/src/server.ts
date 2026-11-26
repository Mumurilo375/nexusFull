import { Resend } from "resend";
import { createClient } from "redis";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const channel = "nexus:emails";
const acceptedChannel = "nexus:emails:accepted";
const logoContent = readFileSync(join(__dirname, "../assets/nexus-logo.png")).toString("base64");
type RedisClient = ReturnType<typeof createClient>;
type EmailEvent = {
  notificationId: string;
  type: "offer.started" | "wishlist.discount" | "order.paid";
  to: string;
  username?: string;
  promotionName?: string;
  promotionDescription?: string | null;
  promotionId?: number;
  promotionCoverImageUrl?: string | null;
  startDate?: string;
  endDate?: string;
  gameTitle?: string;
  discount?: number;
  orderNumber?: string;
  confirmedAt?: string;
  paymentMethod?: string;
  subtotal?: number;
  discountAmount?: number;
  totalAmount?: number;
  items?: Array<Record<string, unknown>>;
};

function formatMoney(value: unknown) {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "Data não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo",
  }).format(date);
}

function getItems(event: EmailEvent) {
  return Array.isArray(event.items) ? event.items : [];
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeHeader(value: unknown, fallback: string) {
  return String(value ?? fallback).replace(/[\r\n\u0000-\u001f\u007f]/g, " ").slice(0, 160);
}

function safeImageUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value, "https://nexus.store");
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

function offerUrl(id: unknown) {
  const offerId = Number(id);
  return Number.isSafeInteger(offerId) && offerId > 0
    ? `https://nexus.store/ofertas/${offerId}`
    : "https://nexus.store/ofertas";
}

function emailLayout(options: {
  preheader: string;
  title: string;
  content: string;
  ctaLabel: string;
  ctaUrl: string;
  heroImageUrl?: string;
}) {
  const preheader = escapeHtml(options.preheader);
  const title = escapeHtml(options.title);
  const heroImage = options.heroImageUrl
    ? `<tr><td style="padding:0 28px 24px"><img src="${escapeHtml(options.heroImageUrl)}" alt="Imagem da oferta Nexus" width="544" style="display:block;width:100%;max-width:544px;height:auto;border:0;border-radius:12px"></td></tr>`
    : "";
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#080d19;color:#e5e7eb;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#080d19;padding:28px 12px"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#111827;border:1px solid #263449;border-radius:16px;overflow:hidden"><tr><td style="padding:20px 28px;border-bottom:1px solid #263449"><a href="https://nexus.store" style="display:inline-flex;align-items:center;color:#fff;text-decoration:none"><img src="cid:nexus-logo" alt="Nexus" width="75" height="36" style="display:block;width:75px;height:36px;border:0"><span style="padding-left:10px;color:#f8fafc;font-size:18px;font-weight:700;letter-spacing:.08em">NEXUS</span></a></td></tr>${heroImage}<tr><td style="padding:0 28px 28px"><h1 style="margin:0 0 18px;color:#f8fafc;font-size:25px;line-height:1.3">${title}</h1>${options.content}<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 8px"><tr><td bgcolor="#2563eb" style="border-radius:9px"><a href="${escapeHtml(options.ctaUrl)}" style="display:inline-block;padding:13px 20px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:9px">${escapeHtml(options.ctaLabel)}</a></td></tr></table><p style="margin:22px 0 0;color:#94a3b8;font-size:13px;line-height:1.6">Precisa de ajuda? <a href="https://nexus.store/comofunciona" style="color:#93c5fd;text-decoration:underline">Acesse a central de ajuda da Nexus</a>.</p></td></tr></table><p style="margin:16px 0 0;color:#64748b;font-size:12px;line-height:1.5;text-align:center">Você recebeu esta mensagem da Nexus. <a href="https://nexus.store" style="color:#94a3b8">nexus.store</a></p></td></tr></table></body></html>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 14px;color:#cbd5e1;font-size:15px;line-height:1.7">${text}</p>`;
}

function detailLabel(text: string) {
  return `<p style="margin:22px 0 10px;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:.08em">${escapeHtml(text)}</p>`;
}

function buildEmail(event: EmailEvent) {
  const name = event.username ?? "cliente Nexus";
  if (event.type === "order.paid") {
    const lines = getItems(event).map((item) => {
      const title = typeof item.gameTitle === "string" ? item.gameTitle : "Jogo";
      const platform = typeof item.platformName === "string" ? item.platformName : "Plataforma";
      const quantity = typeof item.quantity === "number" && Number.isFinite(item.quantity) ? item.quantity : 1;
      const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
      return {
        text: `• ${title} (${platform}) — ${quantity}x ${formatMoney(unitPrice)} = ${formatMoney(unitPrice * quantity)}`,
        html: `<tr><td style="padding:12px 10px;border-bottom:1px solid #263449;color:#e2e8f0;font-size:14px"><strong>${escapeHtml(title)}</strong><br><span style="color:#94a3b8;font-size:12px">${escapeHtml(platform)} · ${quantity}x</span></td><td align="right" style="padding:12px 10px;border-bottom:1px solid #263449;color:#e2e8f0;font-size:14px;white-space:nowrap">${escapeHtml(formatMoney(unitPrice * quantity))}</td></tr>`,
      };
    });
    const paymentMethod = event.paymentMethod === "mercado_pago"
      ? "Mercado Pago"
      : (event.paymentMethod ?? "Não informado").replaceAll("_", " ");
    const subject = safeHeader(`Compra confirmada — pedido ${event.orderNumber ?? "Nexus"}`, "Compra confirmada — Nexus");
    const orderNumber = escapeHtml(event.orderNumber ?? "");
    const itemsText = lines.length ? lines.map((line) => line.text) : ["Itens disponíveis na sua biblioteca Nexus."];
    const itemsHtml = lines.length
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${lines.map((line) => line.html).join("")}</table>`
      : paragraph("Seus itens estão disponíveis na biblioteca Nexus.");
    const content = [
      paragraph(`Olá, <strong style="color:#f8fafc">${escapeHtml(name)}</strong>! Seu pagamento foi confirmado. 🎮`),
      `<div style="margin:18px 0;padding:14px 16px;background:#0b1220;border:1px solid #263449;border-radius:10px"><p style="margin:0;color:#94a3b8;font-size:12px">PEDIDO <strong style="color:#f8fafc">${orderNumber}</strong></p><p style="margin:7px 0 0;color:#cbd5e1;font-size:13px">${escapeHtml(formatDate(event.confirmedAt))} · ${escapeHtml(paymentMethod)}</p></div>`,
      detailLabel("ITENS DA COMPRA"), itemsHtml,
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-top:1px solid #263449"><tr><td style="padding:8px 0;color:#94a3b8;font-size:13px">Subtotal</td><td align="right" style="padding:8px 0;color:#cbd5e1;font-size:13px">${escapeHtml(formatMoney(event.subtotal))}</td></tr><tr><td style="padding:8px 0;color:#94a3b8;font-size:13px">Descontos</td><td align="right" style="padding:8px 0;color:#34d399;font-size:13px">− ${escapeHtml(formatMoney(event.discountAmount))}</td></tr><tr><td style="padding:12px 0;border-top:1px solid #263449;color:#f8fafc;font-size:15px;font-weight:700">Total pago</td><td align="right" style="padding:12px 0;border-top:1px solid #263449;color:#f8fafc;font-size:18px;font-weight:700">${escapeHtml(formatMoney(event.totalAmount))}</td></tr></table>`,
    ].join("");
    return {
      subject,
      text: [
        `Olá, ${name}!`,
        "",
        `O pagamento do pedido ${event.orderNumber ?? ""} foi confirmado em ${formatDate(event.confirmedAt)}.`,order.paid
        "",
        "ITENS DA COMPRA",
        ...(lines.length ? lines : ["Itens disponíveis na sua biblioteca Nexus."]),
        "",
        `Subtotal: ${formatMoney(event.subtotal)}`,
        `Descontos: ${formatMoney(event.discountAmount)}`,
        `Total pago: ${formatMoney(event.totalAmount)}`,
        `Forma de pagamento: ${paymentMethod}`,
        "",
        "Seus jogos estão disponíveis na sua biblioteca Nexus.",
        "https://nexus.store/meus-pedidos",
      ].join("\n"),
      html: emailLayout({
        preheader: `Pagamento confirmado para o pedido ${event.orderNumber ?? "Nexus"}.`,
        title: "Compra confirmada!",
        content,
        ctaLabel: "Ver meus pedidos",
        ctaUrl: "https://nexus.store/meus-pedidos",
      }),
    };
  }
  if (event.type === "wishlist.discount") {
    const priceLines = getItems(event).map((item) => {
      const platform = typeof item.platformName === "string" ? item.platformName : "Plataforma";
      return {
        text: `• ${platform}: De ${formatMoney(item.basePrice)} por ${formatMoney(item.discountedPrice)}`,
        html: `<tr><td style="padding:12px 10px;border-bottom:1px solid #263449;color:#cbd5e1;font-size:14px">${escapeHtml(platform)}</td><td align="right" style="padding:12px 10px;border-bottom:1px solid #263449;color:#94a3b8;font-size:13px;text-decoration:line-through;white-space:nowrap">${escapeHtml(formatMoney(item.basePrice))}</td><td align="right" style="padding:12px 10px;border-bottom:1px solid #263449;color:#34d399;font-size:14px;font-weight:700;white-space:nowrap">${escapeHtml(formatMoney(item.discountedPrice))}</td></tr>`,
      };
    });
    const title = safeHeader(`${event.gameTitle ?? "Jogo da sua lista"} está em oferta — Nexus`, "Jogo da sua lista está em oferta — Nexus");
    const gameTitle = escapeHtml(event.gameTitle ?? "da sua lista de desejos");
    const promotionName = escapeHtml(event.promotionName ?? "Nexus");
    const content = [
      paragraph(`Olá, <strong style="color:#f8fafc">${escapeHtml(name)}</strong>! Um jogo da sua lista de desejos entrou em oferta.`),
      `<div style="margin:18px 0;padding:18px;background:#0b1220;border:1px solid #263449;border-radius:12px"><p style="margin:0;color:#f8fafc;font-size:19px;font-weight:700">${gameTitle}</p><p style="margin:8px 0 0;color:#94a3b8;font-size:13px">Promoção: ${promotionName} · <strong style="color:#34d399">${escapeHtml(event.discount ?? 0)}% OFF</strong></p></div>`,
      detailLabel("COMPARE OS PREÇOS"),
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tr><th align="left" style="padding:8px 10px;color:#64748b;font-size:11px">PLATAFORMA</th><th align="right" style="padding:8px 10px;color:#64748b;font-size:11px">DE</th><th align="right" style="padding:8px 10px;color:#64748b;font-size:11px">POR</th></tr>${priceLines.map((line) => line.html).join("")}</table>`,
    ].join("");
    return {
      subject: title,
      text: [
        `Olá, ${name}!`,
        "",
        `O jogo ${event.gameTitle ?? "da sua lista de desejos"}, que está na sua lista de desejos, entrou em oferta na promoção ${event.promotionName ?? "Nexus"}.`,
        `Desconto: ${event.discount ?? 0}%`,
        "",
        "PREÇOS",
        ...(priceLines.length ? priceLines : ["Consulte o preço promocional na loja Nexus."]),
        "",
        "Acesse a loja Nexus para aproveitar a oferta.",
        offerUrl(event.promotionId),
      ].join("\n"),
      html: emailLayout({
        preheader: `${event.gameTitle ?? "Um jogo da sua lista"} está com ${event.discount ?? 0}% de desconto.`,
        title: "Um jogo da sua lista de desejos entrou em oferta",
        content,
        ctaLabel: "Ver oferta",
        ctaUrl: offerUrl(event.promotionId),
        heroImageUrl: safeImageUrl(event.promotionCoverImageUrl),
      }),
    };
  }
  const allOfferItems = getItems(event);
  const items = allOfferItems.slice(0, 12).map((item) => {
    const title = typeof item.gameTitle === "string" ? item.gameTitle : "Jogo";
    const platform = typeof item.platformName === "string" ? ` (${item.platformName})` : "";
    return {
      text: `• ${title}${platform}`,
      html: `<li style="margin:0 0 8px;color:#cbd5e1;font-size:14px;line-height:1.5"><strong style="color:#f8fafc">${escapeHtml(title)}</strong>${escapeHtml(platform)}</li>`,
    };
  });
  const subject = safeHeader(`Nova oferta: ${event.promotionName ?? "Promoção Nexus"}`, "Nova oferta — Nexus");
  const promotionName = escapeHtml(event.promotionName ?? "Nexus");
  const discount = escapeHtml(event.discount ?? 0);
  const content = [
    paragraph(`Olá, <strong style="color:#f8fafc">${escapeHtml(name)}</strong>! Uma nova promoção começou na Nexus.`),
    typeof event.promotionDescription === "string" && event.promotionDescription.trim()
      ? paragraph(escapeHtml(event.promotionDescription.trim()))
      : "",
    `<div style="margin:18px 0;padding:18px;background:#0b1220;border:1px solid #263449;border-radius:12px"><p style="margin:0;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:.08em">${escapeHtml(String(event.promotionName ?? "Nexus").toUpperCase())}</p><p style="margin:10px 0;color:#60a5fa;font-size:30px;font-weight:800">${discount}% OFF</p><p style="margin:0;color:#cbd5e1;font-size:13px">${escapeHtml(formatDate(event.startDate))} — ${escapeHtml(formatDate(event.endDate))}</p></div>`,
    detailLabel("JOGOS INCLUÍDOS"),
    items.length
      ? `<ul style="margin:0;padding-left:20px">${items.map((item) => item.html).join("")}</ul>`
      : paragraph("Confira os jogos participantes na página da oferta."),
    allOfferItems.length > items.length
      ? paragraph(`E mais ${allOfferItems.length - items.length} jogo(s) na página da oferta.`)
      : "",
  ].join("");
  const description = typeof event.promotionDescription === "string" && event.promotionDescription.trim()
    ? [`${event.promotionDescription.trim()}`, ""]
    : [];
  return {
    subject,
    text: [
      `Olá, ${name}!`,
      "",
      `A promoção ${event.promotionName ?? "Nexus"} começou.`,
      ...description,
      `Desconto: ${event.discount ?? 0}%`,
      `Período: ${formatDate(event.startDate)} até ${formatDate(event.endDate)}`,
      "",
      "JOGOS INCLUÍDOS",
      ...(items.length ? items.map((item) => item.text) : ["Confira os jogos participantes na loja Nexus."]),
      ...(allOfferItems.length > items.length ? [`E mais ${allOfferItems.length - items.length} jogo(s).`] : []),
      "",
      "Acesse a loja Nexus para conferir a oferta.",
      offerUrl(event.promotionId),
    ].join("\n"),
    html: emailLayout({
      preheader: `${event.promotionName ?? "Nova oferta"}: ${event.discount ?? 0}% de desconto na Nexus.`,
      title: `Nova oferta: ${event.promotionName ?? "Nexus"}`,
      content,
      ctaLabel: "Explorar oferta",
      ctaUrl: offerUrl(event.promotionId),
      heroImageUrl: safeImageUrl(event.promotionCoverImageUrl),
    }),
  };
}

function getErrorDetails(error: unknown) {
  const value = error as { name?: unknown; statusCode?: unknown };
  return {
    errorName: typeof value?.name === "string" ? value.name : "ProviderError",
    ...(typeof value?.statusCode === "number" ? { statusCode: value.statusCode } : {}),
  };
}

function log(level: "info" | "warn" | "error", event: string, context: Record<string, string | number | boolean | undefined> = {}) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), level, service: "email-service", event, ...context });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

async function handleMessage(message: string, publisher: RedisClient) {
  let event: EmailEvent;
  try { event = JSON.parse(message) as EmailEvent; }
  catch { log("warn", "email.message.invalid", { reason: "invalid_json" }); return; }
  if (!event.notificationId || !event.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.to) ||
      !["offer.started", "wishlist.discount", "order.paid"].includes(event.type)) {
    log("warn", "email.message.invalid", { reason: "invalid_fields" });
    return;
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    if (!apiKey || !from) throw new Error("Configure RESEND_API_KEY e RESEND_FROM.");

    const resend = new Resend(apiKey);
    const payload = {
      from,
      to: event.to,
      ...buildEmail(event),
      attachments: [{ filename: "nexus-logo.png", content: logoContent, contentType: "image/png", contentId: "nexus-logo" }],
    };
    const contentHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 20);
    const result = await resend.emails.send(payload, {
      idempotencyKey: `nexus/${event.notificationId}/${contentHash}`,
      signal: AbortSignal.timeout(15_000),
    });
    if (result.error) throw result.error;
    if (!result.data?.id) throw new Error("O Resend não confirmou a aceitação do email.");

    await publisher.publish(acceptedChannel, JSON.stringify({
      notificationId: event.notificationId,
      status: "accepted",
      providerEmailId: result.data.id,
    }));
    log("info", "email.accepted_by_provider", { notificationId: event.notificationId, providerEmailId: result.data.id });
  } catch (error) {
    const details = getErrorDetails(error);
    await publisher.publish(acceptedChannel, JSON.stringify({
      notificationId: event.notificationId,
      status: "failed",
      errorName: details.errorName,
    })).catch(() => undefined);
    log("error", "email.provider_rejected", { notificationId: event.notificationId, ...details });
  }
}

async function start() {
  log("info", "server.starting", { providerConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM) });
  const subscriber = createClient({ url: process.env.REDIS_URL ?? "redis://redis:6379" });
  const publisher = createClient({ url: process.env.REDIS_URL ?? "redis://redis:6379" }) as RedisClient;
  subscriber.on("error", () => log("error", "redis.connection.failed", { connection: "subscriber" }));
  publisher.on("error", () => log("error", "redis.connection.failed", { connection: "publisher" }));
  await Promise.all([subscriber.connect(), publisher.connect()]);
  await subscriber.subscribe(channel, (message) => {
    void handleMessage(message, publisher).catch((error) => log("error", "email.processing.failed", { errorName: error instanceof Error ? error.name : "UnknownError" }));
  });
  log("info", "server.started", { channel });
  const stop = () => { log("info", "server.stopping"); void Promise.all([subscriber.quit(), publisher.quit()]).finally(() => { log("info", "server.stopped"); process.exit(0); }); };
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
}

void start().catch((error) => {
  log("error", "server.startup_failed", { errorName: error instanceof Error ? error.name : "UnknownError" });
  process.exit(1);
});
