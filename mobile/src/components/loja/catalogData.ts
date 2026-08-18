import api from "../../services/api";
import type { GamesResponse, ListingsResponse } from "./store.types";

type CatalogData = {
  games: GamesResponse["items"];
  listings: ListingsResponse["items"];
};

let catalogRequest: Promise<CatalogData> | null = null;
let catalogResolvedAt = 0;
const CATALOG_CACHE_TTL_MS = 60_000;

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
          listings: listingsData.items ?? [],
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
