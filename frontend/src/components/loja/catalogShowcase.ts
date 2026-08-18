import type { OfferItem } from "../../pages/offers.types";
import type { GameSummary, ListingMap } from "./store.types";
import type { TopDiscountsCarouselItem } from "./TopDiscountsCarousel";
import type { TopGamesCarouselItem } from "./TopGamesCarousel";
import { getListingDisplayPrice } from "./store.utils";

type FeaturedCarousel = {
  items: TopGamesCarouselItem[];
  hasSales: boolean;
};

type DiscountedCarousel = {
  items: TopDiscountsCarouselItem[];
};

export function buildFeaturedCarousel(
  games: GameSummary[],
  listingByGame: ListingMap,
  limit = 12,
): FeaturedCarousel {
  const items = games.map<TopGamesCarouselItem>((game) => {
    const listings = listingByGame.get(game.id) ?? [];
    const soldCount = listings.reduce(
      (sum, listing) => sum + Math.max(0, Number(listing.stock?.sold ?? 0)),
      0,
    );
    const lowestPrice = listings.reduce<number | null>((lowest, listing) => {
      const price = getListingDisplayPrice(listing);

      if (!Number.isFinite(price) || price <= 0) {
        return lowest;
      }

      return lowest === null || price < lowest ? price : lowest;
    }, null);
    const platforms = Array.from(
      new Set(
        listings
          .map((listing) => String(listing.platform?.name ?? "").trim())
          .filter(Boolean),
      ),
    );

    return {
      id: game.id,
      title: game.title,
      coverImageUrl: game.coverImageUrl,
      soldCount,
      lowestPrice,
      categories: (game.categories ?? []).map((category) => category.name),
      platforms,
    };
  });

  const sortedItems = items.sort((firstItem, secondItem) => {
    if (secondItem.soldCount !== firstItem.soldCount) {
      return secondItem.soldCount - firstItem.soldCount;
    }

    return firstItem.id - secondItem.id;
  });

  return {
    items: sortedItems.slice(0, limit),
    hasSales: sortedItems.some((item) => item.soldCount > 0),
  };
}

export function buildDiscountedCarousel(
  promotions: OfferItem[],
  limit = 12,
): DiscountedCarousel {
  const bestByGame = new Map<number, TopDiscountsCarouselItem & { soldCount: number }>();

  for (const promotion of promotions) {
    for (const listing of promotion.listings) {
      if (listing.isActive === false) {
        continue;
      }

      const gameId = listing.game?.id;
      const platformName = String(listing.platform?.name ?? "").trim();

      if (!gameId) {
        continue;
      }

      const finalPrice = Number(listing.pricing?.finalPrice ?? listing.price ?? 0);
      const discountPercentage = Number(promotion.discountPercentage ?? 0);
      const soldCount = Math.max(0, Number(listing.stock?.sold ?? 0));

      if (!Number.isFinite(finalPrice) || finalPrice <= 0 || discountPercentage <= 0) {
        continue;
      }

      const currentItem = bestByGame.get(gameId);
      const platforms = Array.from(
        new Set([
          ...(currentItem?.platforms ?? []),
          ...(platformName ? [platformName] : []),
        ]),
      );
      const nextItem = {
        id: gameId,
        title: listing.game?.title || promotion.name || "Jogo promocional",
        coverImageUrl: listing.game?.coverImageUrl ?? undefined,
        soldCount,
        discountPercentage,
        finalPrice,
        platforms,
      };

      if (!currentItem) {
        bestByGame.set(gameId, nextItem);
        continue;
      }

      const isBetterDiscount = nextItem.discountPercentage > currentItem.discountPercentage;
      const sameDiscountWithMoreSales =
        nextItem.discountPercentage === currentItem.discountPercentage &&
        nextItem.soldCount > currentItem.soldCount;
      const sameDiscountAndSalesWithBetterPrice =
        nextItem.discountPercentage === currentItem.discountPercentage &&
        nextItem.soldCount === currentItem.soldCount &&
        nextItem.finalPrice < currentItem.finalPrice;

      if (isBetterDiscount || sameDiscountWithMoreSales || sameDiscountAndSalesWithBetterPrice) {
        bestByGame.set(gameId, nextItem);
      } else if (platforms.length !== (currentItem.platforms?.length ?? 0)) {
        bestByGame.set(gameId, { ...currentItem, platforms });
      }
    }
  }

  const sortedItems = Array.from(bestByGame.values()).sort((firstItem, secondItem) => {
    if (secondItem.discountPercentage !== firstItem.discountPercentage) {
      return secondItem.discountPercentage - firstItem.discountPercentage;
    }

    if (secondItem.soldCount !== firstItem.soldCount) {
      return secondItem.soldCount - firstItem.soldCount;
    }

    return firstItem.id - secondItem.id;
  });

  return {
    items: sortedItems.slice(0, limit).map((item) => ({
      id: item.id,
      title: item.title,
      coverImageUrl: item.coverImageUrl,
      discountPercentage: item.discountPercentage,
      finalPrice: item.finalPrice,
      platforms: item.platforms,
    })),
  };
}
