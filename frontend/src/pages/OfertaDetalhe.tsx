import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthRequiredModal from "../components/globals/AuthRequiredModal";
import Footer from "../components/globals/Footer";
import NavBar from "../components/globals/NavBar";
import Pagination from "../components/globals/Pagination";
import ProductCard from "../components/loja/ProductCard";
import { useAuth } from "../contexts/useAuth";
import type { CartFeedback, GameSummary, ListingItem } from "../components/loja/store.types";
import { getRequestErrorMessage, getSelectedListing } from "../components/loja/store.utils";
import type { ApiErrorPayload } from "../services/http";
import api from "../services/api";
import { getApiErrorMessage } from "../services/http";
import { resolveAssetUrl } from "../services/assets";
import type { OfferItem } from "./offers.types";

const OFFER_PAGE_SIZE = 12;

function buildOfferGames(offer: OfferItem): Array<{ game: GameSummary; listings: ListingItem[] }> {
  const byGame = new Map<number, { game: GameSummary; listings: ListingItem[] }>();

  for (const listing of offer.listings) {
    if (listing.isActive === false) {
      continue;
    }

    const gameId = Number(listing.game?.id ?? 0);
    if (!gameId) {
      continue;
    }

    const current = byGame.get(gameId) ?? {
      game: {
        id: gameId,
        title: listing.game?.title || `Jogo ${gameId}`,
        description:
          offer.description ||
          `Jogos em oferta para ${offer.name || "campanha atual"}.`,
        coverImageUrl: listing.game?.coverImageUrl || undefined,
        categories: [],
      },
      listings: [],
    };

    current.listings.push({
      id: listing.id,
      gameId,
      platformId: Number(listing.platform?.id ?? 0) || undefined,
      isActive: true,
      price: Number(listing.pricing?.finalPrice ?? listing.price ?? 0),
      stock: listing.stock,
      pricing: {
        basePrice: Number(listing.pricing?.basePrice ?? listing.price ?? 0),
        discountPercentage: Number(offer.discountPercentage ?? 0),
        finalPrice: Number(listing.pricing?.finalPrice ?? listing.price ?? 0),
        hasDiscount: true,
      },
      platform: {
        id: Number(listing.platform?.id ?? 0),
        name: listing.platform?.name || undefined,
      },
      game: { id: gameId },
    });

    byGame.set(gameId, current);
  }

  return Array.from(byGame.values()).sort((a, b) => a.game.id - b.game.id);
}

export default function OfertaDetalhe() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [offer, setOffer] = useState<OfferItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [cartListingIds, setCartListingIds] = useState<number[]>([]);
  const [selectedListingByGame, setSelectedListingByGame] = useState<Record<number, number>>({});
  const [cartFeedback, setCartFeedback] = useState<CartFeedback | null>(null);
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(null);
  const [pendingCartGameId, setPendingCartGameId] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [page, setPage] = useState(1);

  const offerGames = useMemo(() => (offer ? buildOfferGames(offer) : []), [offer]);
  const totalPages = Math.max(1, Math.ceil(offerGames.length / OFFER_PAGE_SIZE));
  const paginatedOfferGames = useMemo(
    () => offerGames.slice((page - 1) * OFFER_PAGE_SIZE, page * OFFER_PAGE_SIZE),
    [offerGames, page],
  );

  useEffect(() => {
    const loadOffer = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const id = Number(offerId ?? 0);
        if (!id) {
          setOffer(null);
          setErrorMessage("Oferta inválida.");
          return;
        }

        const { data } = await api.get<OfferItem>(`/promotions/${id}`);
        setOffer(data);
      } catch (error) {
        setOffer(null);
        setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar essa oferta."));
      } finally {
        setIsLoading(false);
      }
    };

    void loadOffer();
  }, [offerId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      setCartListingIds([]);
      return;
    }

    const loadUserSelections = async () => {
      try {
        const [{ data: wishlistData }, { data: cartData }] = await Promise.all([
          api.get<{ items: Array<{ gameId: number }> }>("/wishlists"),
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
    setPage(1);
  }, [offerId]);

  const askLogin = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  const goToLogin = () => {
    closeAuthModal();
    void navigate("/login", {
      state: { from: `/ofertas/${offerId}` },
    });
  };

  const openGameDetails = (gameId: number) => {
    void navigate(`/loja/${gameId}`);
  };

  const handleSelectListing = (gameId: number, listingId: number) => {
    setSelectedListingByGame((current) => ({
      ...current,
      [gameId]: listingId,
    }));
    setCartFeedback((current) => (current?.gameId === gameId ? null : current));
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
    } finally {
      setPendingFavoriteId(null);
    }
  };

  const markListingAsOutOfStock = (gameId: number, listingId: number) => {
    setOffer((currentOffer) => {
      if (!currentOffer) {
        return currentOffer;
      }

      return {
        ...currentOffer,
        listings: currentOffer.listings.map((listing) =>
          listing.id === listingId && listing.game?.id === gameId
            ? {
                ...listing,
                stock: {
                  ...listing.stock,
                  available: 0,
                },
              }
            : listing,
        ),
      };
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

  return (
    <div className="nexus-page-shell">
      <NavBar />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-10 pt-28">
        <AuthRequiredModal
          open={showAuthModal}
          title="Entre para continuar"
          message="Para adicionar aos favoritos ou ao carrinho, faça login na sua conta."
          onClose={closeAuthModal}
          onConfirm={goToLogin}
        />

        <section className="nexus-panel p-6 sm:p-8">
          <Link
            to="/ofertas"
            className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/50 hover:text-white"
          >
            Voltar para ofertas
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {offer?.name || "Oferta"}
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">
                {offer?.description || "Jogos incluídos nesta oferta, com plataformas conforme vínculo promocional."}
              </p>
            </div>
            <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200">
              -{Number(offer?.discountPercentage ?? 0)}%
            </span>
          </div>

          {(offer?.bannerImageUrl || offer?.coverImageUrl) && (
            <img
              src={resolveAssetUrl(offer?.bannerImageUrl || offer?.coverImageUrl)}
              alt={offer.name || "Oferta"}
              className="mt-5 h-48 w-full rounded-3xl border border-slate-800 object-cover"
            />
          )}
        </section>

        {isLoading && <p className="mt-6 text-sm text-slate-300">Carregando jogos da oferta...</p>}

        {!isLoading && errorMessage && (
          <p className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && offerGames.length === 0 && (
          <p className="nexus-card mt-6 p-6 text-sm text-slate-300">
            Esta oferta não possui jogos ativos vinculados no momento.
          </p>
        )}

        {!isLoading && !errorMessage && offerGames.length > 0 && (
          <>
            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedOfferGames.map(({ game, listings }) => {
              const selectedListing = getSelectedListing(
                listings,
                selectedListingByGame[game.id],
              );

              return (
                <ProductCard
                  key={game.id}
                  game={game}
                  listings={listings}
                  selectedListing={selectedListing}
                  showOfferPricing
                  inCart={Boolean(
                    selectedListing && cartListingIds.includes(selectedListing.id),
                  )}
                  isFavorite={favoriteIds.includes(game.id)}
                  pendingFavorite={pendingFavoriteId === game.id}
                  pendingCart={pendingCartGameId === game.id}
                  feedback={cartFeedback?.gameId === game.id ? cartFeedback : null}
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
            </section>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
