import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Search, X } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import api from "../../services/api";
import type { ApiErrorPayload } from "../../services/http";
import type { PaginatedResponse } from "../../services/http";
import AuthRequiredModal from "../globals/AuthRequiredModal";
import Pagination from "../globals/Pagination";
import {
  buildDiscountedCarousel,
  buildFeaturedCarousel,
} from "./catalogShowcase";
import ProductCard from "./ProductCard";
import TopDiscountsCarousel from "./TopDiscountsCarousel";
import TopGamesCarousel from "./TopGamesCarousel";
import type { OfferItem } from "../../pages/offers.types";
import type {
  CartFeedback,
  GameSummary,
  ListingMap,
  WishlistResponse,
} from "./store.types";
import { loadCatalogData } from "./catalogData";
import {
  PAGE_SIZE,
  buildCatalogState,
  filterGames,
  getExplicitlySelectedListing,
  getRequestErrorMessage,
  normalizeText,
} from "./store.utils";

export default function ProductCatalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [games, setGames] = useState<GameSummary[]>([]);
  const [listingByGame, setListingByGame] = useState<ListingMap>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [cartListingIds, setCartListingIds] = useState<number[]>([]);
  const [offerPromotions, setOfferPromotions] = useState<OfferItem[]>([]);
  const [offersLoadFailed, setOffersLoadFailed] = useState(false);
  const [selectedListingByGame, setSelectedListingByGame] = useState<
    Record<number, number>
  >({});
  const [cartFeedback, setCartFeedback] = useState<CartFeedback | null>(null);
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(
    null,
  );
  const [pendingCartGameId, setPendingCartGameId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [offersAttempt, setOffersAttempt] = useState(0);
  const [searchDraft, setSearchDraft] = useState(() => searchParams.get("q") ?? "");

  const selectedPlatforms = useMemo(
    () =>
      searchParams
        .getAll("platform")
        .map((value) => value.trim())
        .filter(Boolean),
    [searchParams],
  );
  const selectedCategories = useMemo(
    () =>
      searchParams
        .getAll("category")
        .map((value) => value.trim())
        .filter(Boolean),
    [searchParams],
  );
  const selectedPlatformSet = useMemo(
    () => new Set(selectedPlatforms.map(normalizeText)),
    [selectedPlatforms],
  );
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const isFirstPage = page === 1;

  const filteredGames = useMemo(
    () => filterGames(games, selectedCategories, selectedPlatforms, query),
    [games, query, selectedCategories, selectedPlatforms],
  );
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const paginatedGames = useMemo(
    () => filteredGames.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredGames, page],
  );
  const featuredCarousel = useMemo(
    () => buildFeaturedCarousel(filteredGames, listingByGame),
    [filteredGames, listingByGame],
  );
  const discountedCarousel = useMemo(
    () => buildDiscountedCarousel(offerPromotions),
    [offerPromotions],
  );

  useEffect(() => {
    setPage(1);
  }, [games, query, selectedCategories, selectedPlatforms]);

  useEffect(() => {
    setSearchDraft(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (!cartFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCartFeedback((current) =>
        current?.gameId === cartFeedback.gameId ? null : current,
      );
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [cartFeedback]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError("");

        const { games: gamesData, listings: listingsData } =
          await loadCatalogData();

        const catalog = buildCatalogState(
          gamesData,
          listingsData.filter(
            (listing) => listing.isActive !== false,
          ),
        );

        setGames(catalog.games);
        setListingByGame(catalog.listingByGame);
        setCartFeedback(null);
      } catch (loadError) {
        setGames([]);
        setListingByGame(new Map());
        setError(
          getRequestErrorMessage(
            loadError,
            "Não foi possível carregar os produtos no momento.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    void loadCatalog();
  }, [catalogAttempt]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setOffersLoadFailed(false);
        const { data } = await api.get<PaginatedResponse<OfferItem>>("/promotions", {
          params: { page: 1, limit: 100 },
        });

        setOfferPromotions(
          (data.items ?? []).filter((offer) => offer.isActive && offer.listings.length > 0),
        );
      } catch {
        setOffersLoadFailed(true);
        setOfferPromotions([]);
      }
    };

    void loadOffers();
  }, [offersAttempt]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      setCartListingIds([]);
      return;
    }

    const loadUserSelections = async () => {
      try {
        const [{ data: wishlistData }, { data: cartData }] = await Promise.all([
          api.get<WishlistResponse>("/wishlists"),
          api.get<{ items: Array<{ listingId: number }> }>("/cart"),
        ]);

        setFavoriteIds((wishlistData.items ?? []).map((item) => item.gameId));
        setCartListingIds((cartData.items ?? []).map((item) => item.listingId));
      } catch {
        setFavoriteIds([]);
        setCartListingIds([]);
      }
    };

    void loadUserSelections();
  }, [isAuthenticated]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.requestAnimationFrame(() => {
      document.getElementById("catalog-results")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  };

  const applyCatalogSearch = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    const nextQuery = searchDraft.trim();

    if (nextQuery) {
      nextSearchParams.set("q", nextQuery);
    } else {
      nextSearchParams.delete("q");
    }

    setSearchParams(nextSearchParams);
  };

  const clearCatalogSearch = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("q");
    setSearchDraft("");
    setSearchParams(nextSearchParams);
  };

  const askLogin = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  const goToLogin = () => {
    closeAuthModal();
    void navigate("/login", {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const openGameDetails = (gameId: number) => {
    void navigate(`/loja/${gameId}`);
  };

  const getListingsForGame = (gameId: number) => {
    const listings = listingByGame.get(gameId) ?? [];

    return selectedPlatformSet.size === 0
      ? listings
      : listings.filter((listing) =>
          selectedPlatformSet.has(
            normalizeText(String(listing.platform?.name ?? "")),
          ),
        );
  };

  const handleToggleFavorite = async (gameId: number) => {
    if (!isAuthenticated) {
      askLogin();
      return;
    }

    const isFavorite = favoriteIds.includes(gameId);

    try {
      setPendingFavoriteId(gameId);

      if (isFavorite) {
        await api.delete(`/wishlists/${gameId}`);
        setFavoriteIds((current) => current.filter((id) => id !== gameId));
      } else {
        await api.post(`/wishlists/${gameId}`, {});
        setFavoriteIds((current) => [...current, gameId]);
      }

      window.dispatchEvent(new Event("nexus:counts-updated"));
    } catch (favoriteError) {
      setCartFeedback({
        gameId,
        tone: "error",
        message: getRequestErrorMessage(
          favoriteError,
          "Não foi possível atualizar os favoritos agora.",
        ),
      });
    } finally {
      setPendingFavoriteId(null);
    }
  };

  const handleSelectListing = (gameId: number, listingId: number) => {
    setSelectedListingByGame((current) => ({
      ...current,
      [gameId]: listingId,
    }));
    setCartFeedback((current) => (current?.gameId === gameId ? null : current));
  };

  const markListingAsOutOfStock = (gameId: number, listingId: number) => {
    setListingByGame((current) => {
      const listings = current.get(gameId);
      if (!listings) return current;

      const nextListingByGame = new Map(current);
      nextListingByGame.set(
        gameId,
        listings.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                stock: {
                  ...listing.stock,
                  available: 0,
                },
              }
            : listing,
        ),
      );

      return nextListingByGame;
    });
  };

  const handleAddToCart = async (gameId: number, listingId: number) => {
    if (!isAuthenticated) {
      askLogin();
      return;
    }

    try {
      setCartFeedback(null);
      setPendingCartGameId(gameId);
      await api.post(`/cart/${listingId}`);
      setCartListingIds((current) =>
        current.includes(listingId) ? current : [...current, listingId],
      );
      setCartFeedback({
        gameId,
        tone: "success",
        message: "Item adicionado ao carrinho.",
      });
      window.dispatchEvent(new Event("nexus:counts-updated"));
    } catch (cartError) {
      if (
        isAxiosError<ApiErrorPayload>(cartError) &&
        cartError.response?.data?.code === "OUT_OF_STOCK"
      ) {
        markListingAsOutOfStock(gameId, listingId);
      }

      setCartFeedback({
        gameId,
        tone: "error",
        message: getRequestErrorMessage(
          cartError,
          "Não foi possível adicionar o item ao carrinho.",
        ),
      });
    } finally {
      setPendingCartGameId(null);
    }
  };

  if (loading) {
    return (
      <p
        className="nexus-card px-6 py-5 text-slate-300"
        role="status"
        aria-live="polite"
      >
        Carregando produtos...
      </p>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-5 text-rose-200"
        role="alert"
      >
        <p>{error}</p>
        <button
          type="button"
          onClick={() => setCatalogAttempt((current) => current + 1)}
          className="mt-4 min-h-11 rounded-xl border border-rose-300/40 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:border-rose-200 hover:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <AuthRequiredModal
        open={showAuthModal}
        title="Entre para continuar"
        message="Para adicionar aos favoritos ou ao carrinho, faça login na sua conta."
        onClose={closeAuthModal}
        onConfirm={goToLogin}
      />

      {games.length === 0 && (
        <p className="nexus-card p-6 text-slate-300" role="status">
          Nenhum produto encontrado.
        </p>
      )}

      {games.length > 0 && (
        <form
          id="catalog-results"
          onSubmit={(event) => {
            event.preventDefault();
            applyCatalogSearch();
          }}
          className="mb-4 flex scroll-mt-24 flex-col gap-2 sm:flex-row"
          role="search"
        >
          <label htmlFor="catalog-search" className="sr-only">
            Buscar no catálogo
          </label>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Buscar por nome, gênero ou categoria"
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-11 text-base text-white transition placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-400"
            />
            {searchDraft.trim() && (
              <button
                type="button"
                onClick={clearCatalogSearch}
                className="absolute right-1 top-1/2 inline-flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-900 hover:text-white"
                aria-label="Limpar busca do catálogo"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            Buscar
          </button>
        </form>
      )}

      {games.length > 0 && filteredGames.length === 0 && (
        <div className="nexus-subtle-panel p-6 text-slate-300" role="status">
          <p className="font-semibold text-white">Nenhum jogo encontrado.</p>
          <p className="mt-2 text-sm text-slate-400">
            Tente outro termo ou remova alguns filtros para ampliar os resultados.
          </p>
        </div>
      )}

      {filteredGames.length > 0 && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <p className="text-sm text-slate-300" role="status" aria-live="polite">
              <span className="font-semibold text-white">{filteredGames.length}</span>{" "}
              {filteredGames.length === 1 ? "jogo encontrado" : "jogos encontrados"}
              {query ? ` para “${searchParams.get("q")?.trim()}”` : ""}.
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Página {page} de {totalPages}
            </p>
          </div>

          {isFirstPage && (
            <div className="mb-4 px-1">
              <h2 className="text-xl font-black text-white sm:text-2xl">
                Todos os jogos
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Escolha uma plataforma para comparar preço e disponibilidade.
              </p>
            </div>
          )}

          {offersLoadFailed && isFirstPage && (
            <div
              className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
              role="alert"
              aria-live="polite"
            >
              <p>Não foi possível carregar as ofertas agora.</p>
              <button
                type="button"
                onClick={() => setOffersAttempt((current) => current + 1)}
                className="mt-2 min-h-11 rounded-xl px-3 py-2 font-semibold text-amber-50 underline decoration-amber-300/60 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 min-[540px]:grid-cols-2 xl:grid-cols-3">
            {paginatedGames.map((game) => {
              const listings = getListingsForGame(game.id);
              const selectedListing = getExplicitlySelectedListing(
                listings,
                selectedListingByGame[game.id],
              );

              return (
                <ProductCard
                  key={game.id}
                  game={game}
                  listings={listings}
                  selectedListing={selectedListing}
                  inCart={Boolean(
                    selectedListing &&
                    cartListingIds.includes(selectedListing.id),
                  )}
                  isFavorite={favoriteIds.includes(game.id)}
                  pendingFavorite={pendingFavoriteId === game.id}
                  pendingCart={pendingCartGameId === game.id}
                  feedback={
                    cartFeedback?.gameId === game.id ? cartFeedback : null
                  }
                  onOpen={openGameDetails}
                  onToggleFavorite={(gameId) => {
                    void handleToggleFavorite(gameId);
                  }}
                  onSelectListing={handleSelectListing}
                  onAddToCart={(gameId, listingId) => {
                    void handleAddToCart(gameId, listingId);
                  }}
                />
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          {isFirstPage &&
            (featuredCarousel.items.length > 0 || discountedCarousel.items.length > 0) && (
              <details className="nexus-subtle-panel mt-8 overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-200 transition hover:text-white [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    Descobrir destaques e ofertas
                  </span>
                </summary>
                <div className="space-y-6 border-t border-slate-800 p-4 sm:p-6">
                  {featuredCarousel.items.length > 0 && (
                    <TopGamesCarousel
                      items={featuredCarousel.items}
                      hasSales={featuredCarousel.hasSales}
                      onOpen={openGameDetails}
                    />
                  )}
                  {discountedCarousel.items.length > 0 && (
                    <TopDiscountsCarousel
                      items={discountedCarousel.items}
                      onOpen={openGameDetails}
                    />
                  )}
                </div>
              </details>
            )}
        </>
      )}
    </>
  );
}
