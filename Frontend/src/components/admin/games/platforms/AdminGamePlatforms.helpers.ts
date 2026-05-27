import { createEmptyMeta } from "../../shared/adminShared";
import type {
  PlatformFormState,
  PlatformKeysState,
  PlatformMonitorItem,
} from "../../shared/admin.types";

export const keysPageSize = 8;
export const keyColumnSize = 6;
export const keyGridColumnCount = 3;
export const keyGridBlockSize = keyColumnSize * keyGridColumnCount;
export const emptyKeysMeta = createEmptyMeta(keysPageSize);

export function formatPlatformPrice(price: number | null) {
  return price === null ? "" : Number(price).toFixed(2).replace(".", ",");
}

export function getPlatformPriceLabel(price: number | null) {
  return price === null ? "Sem preço" : `R$ ${formatPlatformPrice(price)}`;
}

export function parsePlatformPrice(value: string) {
  const rawPrice = value.trim().replace(/\s+/g, "");

  if (!rawPrice) {
    return null;
  }

  const normalizedPrice =
    rawPrice.includes(",") && rawPrice.includes(".")
      ? rawPrice.lastIndexOf(",") > rawPrice.lastIndexOf(".")
        ? rawPrice.replace(/\./g, "").replace(",", ".")
        : rawPrice.replace(/,/g, "")
      : rawPrice.replace(",", ".");
  const price = Number(normalizedPrice);

  return Number.isFinite(price) && price > 0 ? price : null;
}

export function sanitizePlatformPrice(value: string) {
  return value.replace(/[^\d,.\s]/g, "");
}

export function formatGameKeyValue(value: string) {
  const rawValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return rawValue.match(/.{1,4}/g)?.join("-") ?? "";
}

function getGameKeyLines(text: string) {
  return text ? text.split(/\r?\n/) : [];
}

function trimTrailingEmptyGameKeyLines(gameKeyLines: string[]) {
  const nextGameKeyLines = [...gameKeyLines];

  while (nextGameKeyLines.length && !nextGameKeyLines[nextGameKeyLines.length - 1]?.trim()) {
    nextGameKeyLines.pop();
  }

  return nextGameKeyLines;
}

export function getPastedGameKeyValues(pastedText: string) {
  return pastedText
    .toUpperCase()
    .split(/\r?\n|[\s,;]+/)
    .flatMap((line) => line.replace(/[^A-Z0-9]/g, "").match(/.{1,12}/g) ?? [])
    .map(formatGameKeyValue)
    .filter(Boolean);
}

export function getGameKeyValues(text: string) {
  const keyValues = getGameKeyLines(text)
    .map(formatGameKeyValue)
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    keyValues,
    hasIncompleteKey: keyValues.some(
      (keyValue) => keyValue.replace(/[^A-Z0-9]/g, "").length !== 12,
    ),
  };
}

function getVisibleGameKeyLines(text: string) {
  const gameKeyLines = trimTrailingEmptyGameKeyLines(
    getGameKeyLines(text).map(formatGameKeyValue),
  );
  const visibleLineCount = Math.max(
    keyGridBlockSize,
    Math.ceil((gameKeyLines.length + 1) / keyGridBlockSize) * keyGridBlockSize,
  );

  return Array.from(
    { length: visibleLineCount },
    (_, lineIndex) => gameKeyLines[lineIndex] ?? "",
  );
}

export function updateGameKeyLineText(text: string, lineIndex: number, lineText: string) {
  const gameKeyLines = getGameKeyLines(text);

  while (gameKeyLines.length <= lineIndex) {
    gameKeyLines.push("");
  }

  gameKeyLines[lineIndex] = formatGameKeyValue(lineText);
  return trimTrailingEmptyGameKeyLines(gameKeyLines).join("\n");
}

export function pasteGameKeyLineText(text: string, startLineIndex: number, pastedText: string) {
  const pastedKeyValues = getPastedGameKeyValues(pastedText);

  if (!pastedKeyValues.length) {
    return updateGameKeyLineText(text, startLineIndex, pastedText);
  }

  const gameKeyLines = getGameKeyLines(text);

  while (gameKeyLines.length < startLineIndex) {
    gameKeyLines.push("");
  }

  pastedKeyValues.forEach((keyValue, pastedIndex) => {
    gameKeyLines[startLineIndex + pastedIndex] = keyValue;
  });

  return trimTrailingEmptyGameKeyLines(gameKeyLines).join("\n");
}

export function getGameKeyLineSections(text: string) {
  const visibleGameKeyLines = getVisibleGameKeyLines(text);

  return Array.from(
    { length: Math.ceil(visibleGameKeyLines.length / keyGridBlockSize) },
    (_, sectionIndex) =>
      visibleGameKeyLines.slice(
        sectionIndex * keyGridBlockSize,
        sectionIndex * keyGridBlockSize + keyGridBlockSize,
      ),
  );
}

export function hasPlatformPriceChanged(formState: PlatformFormState) {
  return parsePlatformPrice(formState.price) !== parsePlatformPrice(formState.originalPrice);
}

export function shouldWarnAboutGlobalPriceChange(
  platform: PlatformMonitorItem,
  formState: PlatformFormState,
) {
  return platform.hasListing && hasPlatformPriceChanged(formState);
}

export function createPlatformFormState(platform: PlatformMonitorItem): PlatformFormState {
  const formattedPrice = formatPlatformPrice(platform.price);

  return {
    price: formattedPrice,
    originalPrice: formattedPrice,
    isActive: platform.isActive,
    newKeysText: "",
    error: "",
    success: "",
    isSaving: false,
    isAddingKeys: false,
  };
}

export function createPlatformKeysState(): PlatformKeysState {
  return {
    isLoading: false,
    isRemoving: false,
    error: "",
    items: [],
    meta: emptyKeysMeta,
    page: 1,
    selectedIds: [],
  };
}

export function createFallbackPlatformMonitorItem(platformId: number): PlatformMonitorItem {
  return {
    platform: { id: platformId, name: "", slug: "" },
    hasListing: false,
    listingId: null,
    price: null,
    isActive: false,
    stock: { available: 0, reserved: 0, sold: 0, total: 0 },
  };
}



