import { createClient } from "redis";
import { createHash } from "node:crypto";

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
  console.warn("Redis indisponível; consultas do catálogo seguirão sem cache.");
});

const ttl = Number(process.env.CACHE_TTL_SECONDS ?? 300);
const cacheTtl = Number.isInteger(ttl) && ttl > 0 ? ttl : 300;

export async function connectCache(): Promise<void> {
  if (!client || client.isOpen) return;

  try {
    await client.connect();
    console.info("Cache Redis conectado.");
  } catch {
    console.warn("Redis indisponível; consultas do catálogo seguirão sem cache.");
  }
}

export async function closeCache(): Promise<void> {
  if (client?.isOpen) await client.quit();
}

export async function rememberCatalog<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!client?.isReady) return load();

  let cacheKey: string;
  try {
    const version = (await client.get(VERSION_KEY)) ?? "0";
    const hash = createHash("sha256").update(key).digest("hex");
    cacheKey = `${PREFIX}:v${version}:${hash}`;
    const cached = await client.get(cacheKey);
    if (cached !== null) {
      console.info("Cache Redis HIT: catálogo.");
      return JSON.parse(cached) as T;
    }
  } catch {
    console.warn("Falha no cache Redis; consulta atendida pelo banco.");
    return load();
  }

  console.info("Cache Redis MISS: catálogo.");
  const value = await load();
  try {
    await client.set(cacheKey, JSON.stringify(value), { EX: cacheTtl });
  } catch {
    console.warn("Falha ao salvar no cache Redis; consulta atendida pelo banco.");
  }

  return value;
}

export async function invalidateCatalogCache(): Promise<void> {
  if (!client?.isReady) return;

  try {
    await client.incr(VERSION_KEY);
    console.info("Cache Redis invalidado: catálogo.");
  } catch {
    console.warn("Não foi possível invalidar o cache Redis do catálogo.");
  }
}
