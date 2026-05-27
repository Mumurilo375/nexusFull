import { isAxiosError } from "axios";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/useAuth";
import api from "../../../services/api";
import { resolveAssetUrl, resolvePlatformLogoUrl } from "../../../services/assets";
import type { ApiErrorPayload } from "../../../services/http";
import { getListingAvailableStock, getRequestErrorMessage } from "../../loja/store.utils";
import type {
  CartResponse,
  ListingsResponse,
  ListingItem,
  WishlistItem,
  WishlistResponse,
} from "../../loja/store.types";

export default function Favorites() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [listingByGame, setListingByGame] = useState<
    Map<number, ListingItem[]>
  >(new Map());
  const [selectedListingByGame, setSelectedListingByGame] = useState<
    Record<number, number>
  >({});
  const [cartListingIds, setCartListingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [removingGameId, setRemovingGameId] = useState<number | null>(null);
  const [pendingCartGameId, setPendingCartGameId] = useState<number | null>(
    null,
  );
  const redirectToLogin = () => {
    void navigate("/login", { state: { from: location.pathname } });
  };
  const isListingOutOfStock = (listing?: ListingItem | null) =>
    Boolean(listing?.stock) && getListingAvailableStock(listing) <= 0;

  useEffect(() => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    const carregarFavoritos = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          { data: wishlistData },
          { data: listingsData },
          { data: cartData },
        ] = await Promise.all([
          api.get<WishlistResponse>("/wishlists"),
          api.get<ListingsResponse>("/listings", {
            params: { page: 1, limit: 100, includeStock: true },
          }),
          api.get<CartResponse>("/cart"),
        ]);

        const listingItems = (listingsData.items ?? []).filter(
          (listing) => listing.isActive !== false,
        );
        const nextListingMap = new Map<number, ListingItem[]>();

        for (const listing of listingItems) {
          const gameId = listing.gameId ?? listing.game?.id;
          if (!gameId) {
            continue;
          }

          const currentListings = nextListingMap.get(gameId) ?? [];
          currentListings.push(listing);
          nextListingMap.set(gameId, currentListings);
        }

        setItems(wishlistData.items ?? []);
        setListingByGame(nextListingMap);
        setCartListingIds((cartData.items ?? []).map((item) => item.listingId));
      } catch (error) {
        setItems([]);
        setListingByGame(new Map());
        setCartListingIds([]);
        setError(
          getRequestErrorMessage(error, "Não foi possível carregar seus favoritos."),
        );
      } finally {
        setLoading(false);
      }
    };

    void carregarFavoritos();
  }, [isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    if (!infoMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setInfoMessage("");
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [infoMessage]);

  const handleRemoveFavorite = async (gameId: number) => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    try {
      setRemovingGameId(gameId);

      await api.delete(`/wishlists/${gameId}`);

      setItems((current) => current.filter((item) => item.gameId !== gameId));
      window.dispatchEvent(new Event("nexus:counts-updated"));
    } finally {
      setRemovingGameId(null);
    }
  };

  const getListingsForGame = (gameId: number) =>
    listingByGame.get(gameId) ?? [];

  const getSelectedListingForGame = (gameId: number) => {
    const listings = getListingsForGame(gameId);
    const selectedId = selectedListingByGame[gameId];

    return selectedId
      ? listings.find((listing) => listing.id === selectedId) ?? listings[0] ?? null
      : listings[0] ?? null;
  };

  const selectListing = (gameId: number, listingId: number) => {
    setSelectedListingByGame((current) => ({
      ...current,
      [gameId]: listingId,
    }));
  };

  const addToCart = async (gameId: number, listingId: number) => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    try {
      setPendingCartGameId(gameId);
      await api.post(`/cart/${listingId}`);
      setCartListingIds((current) =>
        current.includes(listingId) ? current : [...current, listingId],
      );
      window.dispatchEvent(new Event("nexus:counts-updated"));
    } catch (error) {
      if (isAxiosError<ApiErrorPayload>(error) && error.response?.data?.code === "OUT_OF_STOCK") {
        setListingByGame((current) => {
          const listings = current.get(gameId);
          if (!listings) return current;

          const nextListingByGame = new Map(current);
          nextListingByGame.set(
            gameId,
            listings.map((listing) =>
              listing.id === listingId
                ? { ...listing, stock: { ...listing.stock, available: 0 } }
                : listing,
            ),
          );
          return nextListingByGame;
        });
      }

      setInfoMessage(
        getRequestErrorMessage(
          error,
          "Não foi possível adicionar o item ao carrinho.",
        ),
      );
    } finally {
      setPendingCartGameId(null);
    }
  };

  const handleAddToCartClick = (gameTitle: string, gameId: number) => {
    const selectedListing = getSelectedListingForGame(gameId);
    const selectedListingIsOutOfStock = isListingOutOfStock(selectedListing);

    if (!selectedListing) {
      setInfoMessage("Escolha uma plataforma antes de adicionar ao carrinho.");
      return;
    }

    if (selectedListingIsOutOfStock) {
      setInfoMessage("Esta plataforma está sem estoque no momento.");
      return;
    }

    if (cartListingIds.includes(selectedListing.id)) {
      setInfoMessage(`${gameTitle} nessa plataforma já está no seu carrinho.`);
      return;
    }

    void addToCart(gameId, selectedListing.id);
  };

  const wishlistCountLabel = `${items.length} salvos`;

  return (
    <section className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-10 pt-28">
      <div className="rounded-4xl border border-slate-800 bg-slate-950/85 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.4)]">
        <div className="flex flex-col gap-2 border-b border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mt-2 text-4xl font-bold text-white">
              Meus favoritos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Guarde os jogos que chamaram sua atenção para comparar preço,
              plataforma e decidir a compra com calma.
            </p>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
            {wishlistCountLabel}
          </div>
        </div>

        {loading && (
          <p className="mt-6 text-gray-300">Carregando favoritos...</p>
        )}

        {!loading && error && (
          <p className="mt-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {!loading && !error && infoMessage && (
          <p className="mt-6 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
            {infoMessage}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900/55 p-6">
            <p className="text-gray-300">
              Você ainda não favoritou nenhum jogo.
            </p>
            <button
              type="button"
              onClick={() => {
                void navigate("/loja");
              }}
              className="mt-4 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Explorar catálogo
            </button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const game = item.game;
              const listings = getListingsForGame(item.gameId);
              const selectedListing = getSelectedListingForGame(item.gameId);
              const selectedListingIsOutOfStock = isListingOutOfStock(selectedListing);
              const inCart = selectedListing
                ? cartListingIds.includes(selectedListing.id)
                : false;

              if (!game) {
                return null;
              }

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/60 shadow-[0_18px_45px_rgba(2,6,23,0.28)] transition hover:border-blue-500/35 hover:bg-slate-900/80"
                >
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        void handleRemoveFavorite(item.gameId);
                      }}
                      disabled={removingGameId === item.gameId}
                      className="absolute left-4 top-4 z-10 rounded-full border border-slate-700 bg-slate-950/90 p-3 transition hover:border-rose-500/50 disabled:opacity-60"
                      aria-label="Remover dos favoritos"
                    >
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                    </button>

                    <img
                      src={resolveAssetUrl(game.coverImageUrl)}
                      alt={game.title}
                      className="h-60 w-full object-cover"
                    />
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {game.title}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {game.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-200">
                        Escolha a plataforma:
                      </p>
                      {listings.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {listings.map((listing) => {
                            const selected = selectedListing?.id === listing.id;
                            const listingIsOutOfStock = isListingOutOfStock(listing);

                            return (
                              <button
                                key={listing.id}
                                type="button"
                                onClick={() => {
                                  selectListing(item.gameId, listing.id);
                                }}
                                className={`rounded-xl border p-2 transition ${
                                  selected
                                    ? listingIsOutOfStock
                                      ? "border-rose-400/70 bg-rose-500/10"
                                      : "border-blue-500/70 bg-blue-500/15"
                                    : listingIsOutOfStock
                                      ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-400/60"
                                      : "border-slate-700 bg-slate-950/90 hover:border-slate-500"
                                }`}
                                title={listing.platform?.name || "Plataforma"}
                              >
                                <img
                                  src={resolvePlatformLogoUrl(listing.platform?.name)}
                                  alt={listing.platform?.name || "Plataforma"}
                                  className={`h-8 w-8 object-contain ${listingIsOutOfStock ? "opacity-55" : ""}`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">
                          Nenhuma plataforma disponível para este jogo.
                        </p>
                      )}

                      {selectedListing?.stock && (
                        <p
                          className={`text-xs font-medium ${
                            selectedListingIsOutOfStock ? "text-rose-200" : "text-emerald-200"
                          }`}
                        >
                          {selectedListingIsOutOfStock
                            ? "Plataforma indisponível no momento."
                            : `Estoque disponível: ${getListingAvailableStock(selectedListing)}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <p className="text-lg font-semibold text-blue-100">
                        {selectedListing?.price
                          ? `R$ ${Number(selectedListing.price).toFixed(2)}`
                          : "Escolha a plataforma"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddToCartClick(game.title, item.gameId);
                        }}
                        className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${
                          selectedListingIsOutOfStock
                            ? "cursor-not-allowed border border-rose-500/40 bg-rose-500/10 text-rose-100"
                            : "bg-blue-600 hover:bg-blue-500"
                        }`}
                        disabled={
                          !selectedListing ||
                          pendingCartGameId === item.gameId ||
                          inCart ||
                          selectedListingIsOutOfStock
                        }
                      >
                        {!selectedListing
                          ? "Escolha a plataforma"
                          : inCart
                            ? "No carrinho"
                            : selectedListingIsOutOfStock
                              ? "Sem estoque"
                            : pendingCartGameId === item.gameId
                              ? "Adicionando..."
                              : "Adicionar no carrinho"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
