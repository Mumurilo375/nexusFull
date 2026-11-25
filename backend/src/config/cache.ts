import { createClient } from "redis";
import { createHash } from "node:crypto";
import { log } from "../utils/logger";

const PREFIX = "nexus:cache:catalog";
const VERSION_KEY = `${PREFIX}:version`;
const client = process.env.REDIS_URL
  ? createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 3_000,
        reconnectStrategy: (retries) => retries >= 3 ? false : retries * 250,
      },
    })
  : null;

client?.on("error", () => {
  log("warn", "CACHE indisponível", { acao: "consultar banco" });
});

const CACHE_TTL_SECONDS = 300;

function describeResult(value: unknown): string {
  if (!value || typeof value !== "object") return "resultado disponível";
  const record = value as Record<string, unknown>;
  const describeItem = (item: unknown): string => {
    if (!item || typeof item !== "object") return "item";
    const data = item as Record<string, unknown>;
    const id = typeof data.id === "number" ? `ID ${data.id}` : "item";
    const name = typeof data.title === "string" ? data.title : data.name;
    return typeof name === "string" ? `${id}: ${name.slice(0, 100)}` : id;
  };
  if (Array.isArray(record.items)) {
    const items = record.items.slice(0, 5).map(describeItem).join(", ");
    const remaining = record.items.length > 5 ? `; +${record.items.length - 5}` : "";
    return `${record.items.length} item(ns)${items ? `: ${items}${remaining}` : ""}`;
  }
  return describeItem(record);
}

function describeQuery(key: string): Record<string, string | number | boolean | undefined> {
  const parts = key.split(":", 3);
  const input = parts[2] ?? "";
  if (parts[1] === "details" && /^\d+$/.test(input)) return { id: Number(input) };
  if (parts[1] !== "list") return {};
  try {
    const query = JSON.parse(key.slice(key.indexOf(":", key.indexOf(":") + 1) + 1)) as Record<string, unknown>;
    return {
      pagina: typeof query.page === "number" ? query.page : undefined,
      limite: typeof query.limit === "number" ? query.limit : undefined,
      jogoId: typeof query.gameId === "number" ? query.gameId : undefined,
      estoque: typeof query.includeStock === "boolean" ? query.includeStock : undefined,
      ativas: typeof query.activeNow === "boolean" ? query.activeNow : undefined,
      buscaPorTexto: typeof query.q === "string" && query.q.length > 0 ? true : undefined,
    };
  } catch {
    return {};
  }
}

export async function connectCache(): Promise<void> {
  if (!client || client.isOpen) return;

  try {
    await client.connect();
    log("info", "CACHE conectado", { ttlSegundos: CACHE_TTL_SECONDS });
  } catch {
    log("warn", "CACHE indisponível", { acao: "consultar banco" });
  }
}

export async function closeCache(): Promise<void> {
  if (client?.isOpen) await client.quit();
}

export async function rememberCatalog<T>(
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  const startedAt = process.hrtime.bigint();
  const elapsedMs = () => Math.round(Number(process.hrtime.bigint() - startedAt) / 10_000) / 100;
  const consulta = key.startsWith("games:list:") ? "lista de jogos"
    : key.startsWith("games:details:") ? "detalhes do jogo"
    : key.startsWith("listings:list:") ? "lista de ofertas"
    : key.startsWith("promotions:list:") ? "lista de promoções"
    : key.startsWith("promotions:details:") ? "detalhes da promoção"
    : "catálogo";
  if (!client?.isReady) {
    log("warn", "CACHE ignorado", { consulta, motivo: "Redis indisponível" });
    return load();
  }

  let cacheKey: string;
  try {
    const version = (await client.get(VERSION_KEY)) ?? "0";
    const hash = createHash("sha256").update(key).digest("hex");
    cacheKey = `${PREFIX}:v${version}:${hash}`;
    const cached = await client.get(cacheKey);
    if (cached !== null) {
      const value = JSON.parse(cached) as T;
      log("info", "CACHE HIT", { consulta, ...describeQuery(key), resultado: describeResult(value), origem: "Redis", tempoMs: elapsedMs() });
      return value;
    }
  } catch {
    log("warn", "CACHE falha na leitura", { consulta, acao: "consultar banco" });
    return load();
  }

  const value = await load();
  try {
    await client.set(cacheKey, JSON.stringify(value), { EX: CACHE_TTL_SECONDS });
  } catch {
    log("warn", "CACHE falha ao salvar", { consulta });
  }

  log("info", "CACHE MISS", { consulta, ...describeQuery(key), resultado: describeResult(value), origem: "banco", tempoMs: elapsedMs() });
  return value;
}

export async function invalidateCatalogCache(): Promise<void> {
  if (!client?.isReady) return;

  try {
    const versao = await client.incr(VERSION_KEY);
    log("info", "CACHE invalidado", { versao });
  } catch {
    log("warn", "CACHE falha na invalidação", { consulta: "catálogo" });
  }
}
