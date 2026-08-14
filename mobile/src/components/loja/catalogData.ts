import api from "../../services/api";
import type { GamesResponse, ListingsResponse } from "./store.types";

type CatalogData = {
  games: GamesResponse["items"];
  listings: ListingsResponse["items"];
};

let catalogRequest: Promise<CatalogData> | null = null;

export function loadCatalogData() {
  if (!catalogRequest) {
    catalogRequest = Promise.all([
      api.get<GamesResponse>("/games?page=1&limit=60"),
      api.get<ListingsResponse>("/listings?page=1&limit=200&includeStock=true"),
    ])
      .then(([gamesData, listingsData]) => ({
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
