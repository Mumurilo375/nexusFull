import api from "../../services/api";
import type { GameSummary, GamesResponse, ListingItem, ListingsResponse } from "./store.types";

type CatalogData = {
  games: GamesResponse["items"];
  listings: ListingsResponse["items"];
};

let catalogRequest: Promise<CatalogData> | null = null;
let catalogResolvedAt = 0;
const CATALOG_CACHE_TTL_MS = 60_000;

type GameWithListings = GameSummary & { platformListings?: ListingItem[] };

function mergeCatalogListings(games: GameSummary[], listings: ListingItem[]): ListingItem[] {
  const listingsById = new Map<number, ListingItem>(listings.map((listing) => [listing.id, listing]));

  for (const game of games as GameWithListings[]) {
    for (const gameListing of game.platformListings ?? []) {
      const existingListing = listingsById.get(gameListing.id);
      listingsById.set(gameListing.id, {
        ...existingListing,
        ...gameListing,
        game: {
          ...existingListing?.game,
          ...gameListing.game,
          id: game.id,
          title: game.title,
          coverImageUrl: game.coverImageUrl,
        },
        // /games já devolve a listagem enriquecida com plataforma e estoque.
        platform: gameListing.platform ?? existingListing?.platform,
        stock: gameListing.stock ?? existingListing?.stock,
      });
    }
  }

  return Array.from(listingsById.values());
}

export function loadCatalogData({ forceRefresh = false }: { forceRefresh?: boolean } = {}) {
  const cacheExpired = catalogResolvedAt > 0 && Date.now() - catalogResolvedAt >= CATALOG_CACHE_TTL_MS;
  if (forceRefresh || cacheExpired) catalogRequest = null;

  if (!catalogRequest) {
    catalogRequest = Promise.all([
      api.get<GamesResponse>("/games?page=1&limit=60"),
      api.get<ListingsResponse>("/listings?page=1&limit=200&includeStock=true"),
    ])
      .then(([gamesData, listingsData]) => {
        catalogResolvedAt = Date.now();
        return {
          games: gamesData.items ?? [],
          listings: mergeCatalogListings(gamesData.items ?? [], listingsData.items ?? []),
        };
      })
      .catch((error) => {
        catalogRequest = null;
        catalogResolvedAt = 0;
        throw error;
      });
  }

  return catalogRequest;
}
