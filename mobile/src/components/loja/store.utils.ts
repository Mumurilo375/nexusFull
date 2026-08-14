import { getApiErrorMessage } from "../../services/http";
import type { GameImage, GameSummary, ListingItem, ListingMap, ReviewItem } from "./store.types";

export type FilterOption = { label: string; count: number };

export const PAGE_SIZE = 12;
export const REVIEW_COMMENT_MAX_LENGTH = 500;

export const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

export const toMoney = (value: number) => `R$ ${value.toFixed(2)}`;

export const getListingAvailableStock = (listing: ListingItem | null | undefined) =>
  Math.max(0, Number(listing?.stock?.available ?? 0));

export const getListingDisplayPrice = (listing: ListingItem | null | undefined) =>
  Number(listing?.pricing?.finalPrice ?? listing?.price ?? 0);

export const getListingDiscountPercentage = (listing: ListingItem | null | undefined) => {
  const explicitDiscount = Number(listing?.pricing?.discountPercentage ?? 0);
  if (Number.isFinite(explicitDiscount) && explicitDiscount > 0) return explicitDiscount;

  const basePrice = Number(listing?.pricing?.basePrice ?? listing?.price ?? 0);
  const finalPrice = Number(listing?.pricing?.finalPrice ?? basePrice);
  if (!Number.isFinite(basePrice) || !Number.isFinite(finalPrice) || basePrice <= 0 || finalPrice <= 0 || finalPrice >= basePrice) {
    return 0;
  }

  return Math.round((1 - finalPrice / basePrice) * 100);
};

export const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
};

export function getSelectedListing(listings: ListingItem[], selectedId?: number | null) {
  return listings.find((listing) => listing.id === selectedId) ?? listings[0] ?? null;
}

export function getExplicitlySelectedListing(listings: ListingItem[], selectedId?: number | null) {
  return listings.find((listing) => listing.id === selectedId) ?? null;
}

export function getGalleryImages(coverImage: string, images?: GameImage[]) {
  return Array.from(new Set([
    coverImage,
    ...(images ?? []).map((image) => image.imageUrl?.trim() ?? ""),
  ].filter(Boolean)));
}

export const getAverageRating = (reviews: ReviewItem[]) =>
  reviews.length === 0 ? 0 : reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / reviews.length;

export const hasUserReviewVote = (review: ReviewItem, userId: number) =>
  (review.votes ?? []).some((vote) => Number(vote.userId ?? vote.user?.id ?? 0) === userId);

export function toggleNormalizedValue(values: string[], value: string) {
  const normalizedValue = normalizeText(value);
  return values.some((current) => normalizeText(current) === normalizedValue)
    ? values.filter((current) => normalizeText(current) !== normalizedValue)
    : [...values, value];
}

export function filterGames(games: GameSummary[], categories: string[], platforms: string[], query: string) {
  const categoryFilters = new Set(categories.map(normalizeText));
  const platformFilters = new Set(platforms.map(normalizeText));
  const filteredByCategory = categoryFilters.size === 0
    ? games
    : games.filter((game) => (game.categories ?? []).some((category) => categoryFilters.has(normalizeText(category.name))));
  const filteredByPlatform = platformFilters.size === 0
    ? filteredByCategory
    : filteredByCategory.filter((game) => (game.platforms ?? []).some((platform) => platformFilters.has(normalizeText(platform))));

  return query
    ? filteredByPlatform.filter((game) => `${game.title} ${game.description ?? ""}`.toLowerCase().includes(query))
    : filteredByPlatform;
}

export function buildCatalogState(games: GameSummary[], listings: ListingItem[]) {
  const listingByGame: ListingMap = new Map();
  const lowestPriceByGame = new Map<number, number>();
  const platformsByGame = new Map<number, Set<string>>();

  for (const listing of listings) {
    const gameId = listing.gameId ?? listing.game?.id;
    if (!gameId) continue;

    listingByGame.set(gameId, [...(listingByGame.get(gameId) ?? []), listing]);
    const platformName = String(listing.platform?.name ?? "").trim();
    if (platformName) {
      const platformSet = platformsByGame.get(gameId) ?? new Set<string>();
      platformSet.add(platformName);
      platformsByGame.set(gameId, platformSet);
    }

    const parsedPrice = getListingDisplayPrice(listing);
    const currentLowestPrice = lowestPriceByGame.get(gameId);
    if (Number.isFinite(parsedPrice) && (currentLowestPrice === undefined || parsedPrice < currentLowestPrice)) {
      lowestPriceByGame.set(gameId, parsedPrice);
    }
  }

  return {
    games: games.map((game) => ({
      ...game,
      price: lowestPriceByGame.get(game.id) ?? game.price,
      platforms: Array.from(platformsByGame.get(game.id) ?? []),
    })),
    listingByGame,
  };
}

function sortedOptions(optionMap: Map<string, Set<number>>) {
  return Array.from(optionMap.entries())
    .map(([label, values]) => ({ label, count: values.size }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function collectFilterOptions(games: GameSummary[], listings: ListingItem[]) {
  const categories = new Map<string, Set<number>>();
  const platforms = new Map<string, Set<number>>();

  games.forEach((game) => {
    (game.categories ?? []).forEach((category) => {
      const label = category.name.trim();
      if (!label) return;
      categories.set(label, new Set([...(categories.get(label) ?? []), game.id]));
    });
  });

  listings.filter((listing) => listing.isActive !== false).forEach((listing) => {
    const label = String(listing.platform?.name ?? "").trim();
    const gameId = listing.gameId ?? listing.game?.id;
    if (!label || !gameId) return;
    platforms.set(label, new Set([...(platforms.get(label) ?? []), gameId]));
  });

  return { categories: sortedOptions(categories), platforms: sortedOptions(platforms) };
}

export function getRequestErrorMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
