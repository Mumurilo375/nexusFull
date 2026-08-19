import { createEmptyMeta } from "../../shared/adminShared";
import type { PlatformFormState, PlatformKeysState, PlatformMonitorItem } from "../../shared/admin.types";
export const keysPageSize = 8;
export const emptyKeysMeta = createEmptyMeta(keysPageSize);
export function formatPlatformPrice(price: number | null) { return price === null ? "" : Number(price).toFixed(2).replace(".", ","); }
export function getPlatformPriceLabel(price: number | null) { return price === null ? "Sem preço" : `R$ ${formatPlatformPrice(price)}`; }
export function parsePlatformPrice(value: string) { const raw = value.trim().replace(/\s+/g, ""); if (!raw) return null; const normalized = raw.includes(",") && raw.includes(".") ? raw.lastIndexOf(",") > raw.lastIndexOf(".") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "") : raw.replace(",", "."); const price = Number(normalized); return Number.isFinite(price) && price > 0 ? price : null; }
export function sanitizePlatformPrice(value: string) { return value.replace(/[^\d,.\s]/g, ""); }
export function formatGameKeyValue(value: string) { const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12); return raw.match(/.{1,4}/g)?.join("-") ?? ""; }
export function formatGameKeyText(value: string) {
  const lines = value.toUpperCase().split(/\r?\n/);
  const formattedLines = lines.flatMap((line) => {
    const rawLine = line.replace(/[^A-Z0-9]/g, "");
    return rawLine.match(/.{1,12}/g)?.map(formatGameKeyValue) ?? [];
  });
  const lastLine = lines[lines.length - 1]?.replace(/[^A-Z0-9]/g, "") ?? "";
  const hasTrailingLineBreak = /\r?\n$/.test(value);
  const shouldStartNextLine = !hasTrailingLineBreak && lastLine.length === 12;

  return `${formattedLines.join("\n")}${hasTrailingLineBreak || shouldStartNextLine ? "\n" : ""}`;
}

export function getGameKeyValues(text: string) {
  const keyValues = formatGameKeyText(text).split(/\r?\n|[\s,;]+/).map(formatGameKeyValue).filter(Boolean);
  return { keyValues, hasIncompleteKey: keyValues.some((value) => value.replace(/[^A-Z0-9]/g, "").length !== 12) };
}
export function hasPlatformPriceChanged(form: PlatformFormState) { return parsePlatformPrice(form.price) !== parsePlatformPrice(form.originalPrice); }
export function createPlatformFormState(platform: PlatformMonitorItem): PlatformFormState { const price = formatPlatformPrice(platform.price); return { price, originalPrice: price, isActive: platform.isActive, newKeysText: "", error: "", success: "", isSaving: false, isAddingKeys: false }; }
export function createPlatformKeysState(): PlatformKeysState { return { isLoading: false, isRemoving: false, error: "", items: [], meta: emptyKeysMeta, page: 1, selectedIds: [] }; }
