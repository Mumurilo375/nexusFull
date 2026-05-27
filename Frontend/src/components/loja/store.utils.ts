import { isAxiosError } from "axios";
import { getApiErrorMessage } from "../../services/http";
import type { GameImage, GameSummary, ListingItem, ListingMap, ReviewItem } from "./store.types";

export type FilterOption = {
  label: string;
  count: number;
};

export const PAGE_SIZE = 12;
export const REVIEW_COMMENT_MAX_LENGTH = 500;
export const OFFLINE_API_MESSAGE = "Não foi possível se conectar agora. Confira sua internet e tente novamente.";
export const clampTextStyle = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" };

export const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
export const toMoney = (value: number) => `R$ ${value.toFixed(2)}`;
export const getListingAvailableStock = (listing: ListingItem | null | undefined) =>
  Math.max(0, Number(listing?.stock?.available ?? 0));
export const getListingDisplayPrice = (listing: ListingItem | null | undefined) =>
  Number(listing?.pricing?.finalPrice ?? listing?.price ?? 0);
export const getListingDiscountPercentage = (listing: ListingItem | null | undefined) => {
  const explicitDiscount = Number(listing?.pricing?.discountPercentage ?? 0);
  if (Number.isFinite(explicitDiscount) && explicitDiscount > 0) {
    return explicitDiscount;
  }

  const basePrice = Number(listing?.pricing?.basePrice ?? listing?.price ?? 0);
  const finalPrice = Number(listing?.pricing?.finalPrice ?? basePrice);

  if (!Number.isFinite(basePrice) || !Number.isFinite(finalPrice)) {
    return 0;
  }

  if (basePrice <= 0 || finalPrice <= 0 || finalPrice >= basePrice) {
    return 0;
  }

  return Math.round((1 - finalPrice / basePrice) * 100);
};

export function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
}

export function getSelectedListing(listings: ListingItem[], selectedId?: number | null) {
  return listings.find((listing) => listing.id === selectedId) ?? listings[0] ?? null;
}

export function getGalleryImages(coverImage: string, images?: GameImage[]) {
  return Array.from(
    new Set([
      coverImage,
      ...(images ?? []).map((image) => image.imageUrl?.trim() ?? ""),
    ].filter(Boolean)),
  );
}

export function getAverageRating(reviews: ReviewItem[]) {
  return reviews.length === 0
    ? 0
    : reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / reviews.length;
}

export const hasUserReviewVote = (review: ReviewItem, userId: number) =>
  (review.votes ?? []).some((vote) => Number(vote.userId ?? vote.user?.id ?? 0) === userId);

export function toggleNormalizedValue(values: string[], value: string) {
  const normalizedValue = normalizeText(value);
  return values.some((current) => normalizeText(current) === normalizedValue)
    ? values.filter((current) => normalizeText(current) !== normalizedValue)
    : [...values, value];
}

export function updateSearchListParam(searchParams: URLSearchParams, key: string, values: string[]) {
  const nextSearchParams = new URLSearchParams(searchParams);
  nextSearchParams.delete(key);
  values.forEach((value) => value.trim() && nextSearchParams.append(key, value.trim()));
  return nextSearchParams;
}

export function filterGames(
  games: GameSummary[],
  selectedCategories: string[],
  selectedPlatforms: string[],
  query: string,
) {
  const categoryFilters = new Set(selectedCategories.map(normalizeText));
  const platformFilters = new Set(selectedPlatforms.map(normalizeText));
  const filteredByCategory = categoryFilters.size === 0
    ? games
    : games.filter((game) =>
        (game.categories ?? []).some((category) => categoryFilters.has(normalizeText(category.name))),
      );
  const filteredByPlatform = platformFilters.size === 0
    ? filteredByCategory
    : filteredByCategory.filter((game) =>
        (game.platforms ?? []).some((platform) => platformFilters.has(normalizeText(platform))),
      );

  return query
    ? filteredByPlatform.filter((game) => game.title.toLowerCase().includes(query))
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

    const parsedPrice = Number(listing.price);
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

const getSortedFilterOptions = (optionMap: Map<string, Set<number | string>>) =>
  Array.from(optionMap.entries())
    .map(([label, values]) => ({ label, count: values.size }))
    .sort((firstOption, secondOption) => firstOption.label.localeCompare(secondOption.label));

export function collectFilterOptions(
  games: Array<{ categories?: Array<{ name: string }> }>,
  listings: ListingItem[],
) {
  const categoriesByGame = new Map<string, Set<number | string>>();
  const platformsByGame = new Map<string, Set<number | string>>();

  games.forEach((game, gameIndex) => {
    const gameKey = "id" in game && typeof game.id === "number" ? game.id : `game-${gameIndex}`;

    (game.categories ?? []).forEach((category) => {
      const categoryName = category.name.trim();
      if (!categoryName) return;

      const categoryGames = categoriesByGame.get(categoryName) ?? new Set<number | string>();
      categoryGames.add(gameKey);
      categoriesByGame.set(categoryName, categoryGames);
    });
  });

  listings
    .filter((listing) => listing.isActive !== false)
    .forEach((listing, listingIndex) => {
      const platformName = String(listing.platform?.name ?? "").trim();
      if (!platformName) return;

      const platformGames = platformsByGame.get(platformName) ?? new Set<number | string>();
      platformGames.add(listing.gameId ?? listing.game?.id ?? `listing-${listingIndex}`);
      platformsByGame.set(platformName, platformGames);
    });

  return {
    categories: getSortedFilterOptions(categoriesByGame),
    platforms: getSortedFilterOptions(platformsByGame),
  };
}

export function getRequestErrorMessage<TError>(
  error: TError,
  fallbackMessage: string,
  offlineMessage = OFFLINE_API_MESSAGE,
) {
  return isAxiosError(error) && !error.response
    ? offlineMessage
    : getApiErrorMessage(error, fallbackMessage);
}
