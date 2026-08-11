import type { AdminOfferFormState, AdminOfferListingOption } from "../shared/admin.types";

export function createEmptyOfferFormState(): AdminOfferFormState {
  return {
    name: "",
    description: "",
    coverImageUrl: "",
    bannerImageUrl: "",
    discountPercentage: "",
    startDate: "",
    endDate: "",
    isActive: true,
    platformId: "",
  };
}

export function normalizeDateInput(value?: string) {
  return value ? String(value).slice(0, 10) : "";
}

export function formatDateToPtBr(value?: string) {
  const isoDate = normalizeDateInput(value);
  if (!isoDate) return "";

  const [year, month, day] = isoDate.split("-");
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
}

export function normalizeDiscountInput(value: string) {
  return value ? String(Math.min(100, Math.max(1, Number(value) || 0))) : "";
}

export function buildListingLabel(listing: {
  game?: { title?: string | null } | null;
  platform?: { name?: string | null } | null;
}) {
  return `${listing.game?.title || "Jogo"} · ${listing.platform?.name || "Plataforma"}`;
}

export function getListingTitle(listing: {
  game?: { title?: string | null } | null;
}) {
  return listing.game?.title || "Jogo";
}

export function getListingPlatformName(listing: {
  platform?: { name?: string | null } | null;
}) {
  return listing.platform?.name || "Plataforma";
}

export function matchesListingSearch(listing: AdminOfferListingOption, searchText: string) {
  const normalizedSearchText = searchText.trim().toLowerCase();
  if (!normalizedSearchText) return true;

  return (
    String(listing.game?.title ?? "").toLowerCase().includes(normalizedSearchText) ||
    String(listing.platform?.name ?? "").toLowerCase().includes(normalizedSearchText)
  );
}

export function mergeListingIds(currentIds: number[], nextIds: number[]) {
  return Array.from(new Set([...currentIds, ...nextIds]));
}

export function buildPlatformOptions(listings: AdminOfferListingOption[]) {
  const platformMap = new Map<number, { id: number; name: string }>();

  listings.forEach((listing) => {
    const platformId = Number(listing.platform?.id ?? 0);
    if (!platformId || platformMap.has(platformId)) return;

    platformMap.set(platformId, {
      id: platformId,
      name: listing.platform?.name || "Plataforma",
    });
  });

  return Array.from(platformMap.values());
}

