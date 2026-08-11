import api from "../../services/api";
import type { GamesResponse, ListingsResponse } from "./store.types";

type CatalogData = {
  games: NonNullable<GamesResponse["items"]>;
  listings: NonNullable<ListingsResponse["items"]>;
};

let catalogRequest: Promise<CatalogData> | null = null;

export function loadCatalogData() {
  if (!catalogRequest) {
    catalogRequest = Promise.all([
      api.get<GamesResponse>("/games", {
        params: { page: 1, limit: 60 },
      }),
      api.get<ListingsResponse>("/listings", {
        params: { page: 1, limit: 200, includeStock: true },
      }),
    ])
      .then(([{ data: gamesData }, { data: listingsData }]) => ({
        games: gamesData.items ?? [],
        listings: listingsData.items ?? [],
      }))
      .catch((error) => {
        catalogRequest = null;
        throw error;
      });
  }

  return catalogRequest;
}
