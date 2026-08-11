import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import AuthRequiredModal from "../globals/AuthRequiredModal";
import api from "../../services/api";
import { resolveAssetUrl } from "../../services/assets";
import { isAuthenticated } from "../../services/auth";
import DetailsGallery from "./DetailsGallery";
import DetailsSidebar from "./DetailsSidebar";
import type { CartResponse, GameDetails } from "./store.types";
import {
  formatDate,
  getGalleryImages,
  getListingAvailableStock,
  getRequestErrorMessage,
  getSelectedListing,
} from "./store.utils";

export default function ProductDetails() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const parsedGameId = Number(gameId);
  const gameIdIsValid = Number.isInteger(parsedGameId) && parsedGameId > 0;

  const [details, setDetails] = useState<GameDetails | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(
    null,
  );
  const [selectedImage, setSelectedImage] = useState("");
  const [cartListingIds, setCartListingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyCart, setBusyCart] = useState(false);
  const [busyBuyNow, setBusyBuyNow] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const platformListings = useMemo(
    () => details?.platformListings ?? [],
    [details?.platformListings],
  );
  const currentListing = useMemo(
    () => getSelectedListing(platformListings, selectedListingId),
    [platformListings, selectedListingId],
  );
  const currentListingId = Number(currentListing?.id ?? 0);
  const availableStock = getListingAvailableStock(currentListing);
  const coverImage = resolveAssetUrl(details?.coverImageUrl);
  const galleryImages = useMemo(() => {
    const resolvedImages = (details?.images ?? []).map((image) => ({
      ...image,
      imageUrl: resolveAssetUrl(image.imageUrl, ""),
    }));

    return getGalleryImages(coverImage, resolvedImages);
  }, [coverImage, details?.images]);

  const gameTitle = details?.title || "Jogo";
  const gameDescription = details?.description || "Sem descrição curta.";
  const gameLongDescription = details?.longDescription || gameDescription;
  const reviewCount = Number(details?.reviewStats?.totalReviews ?? 0);
  const reviewAverage = Number(details?.reviewStats?.averageRating ?? 0);
  const inCart = currentListingId > 0 && cartListingIds.includes(currentListingId);
  const infoItems = useMemo(
    () => [
      { label: "Lançamento", value: formatDate(details?.releaseDate) },
      {
        label: "Avaliação",
        value: reviewCount === 0 ? "Ainda sem avaliações." : `${reviewAverage.toFixed(1)} / 5`,
      },
    ],
    [details?.releaseDate, reviewAverage, reviewCount],
  );

  const askLogin = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const goToLogin = () => {
    closeAuthModal();
    void navigate("/login", {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  useEffect(() => {
    if (!gameIdIsValid) {
      setLoading(false);
      setError("Jogo inválido.");
      setDetails(null);
      return;
    }

    let active = true;

    const loadDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setActionError("");

        const { data } = await api.get<GameDetails>(`/games/${parsedGameId}/details`);
        if (!active) return;

        setDetails(data);
      } catch (loadError) {
        if (!active) return;
        setDetails(null);
        setError(
          getRequestErrorMessage(
            loadError,
            "Não foi possível carregar os detalhes do jogo.",
          ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      active = false;
    };
  }, [gameIdIsValid, parsedGameId]);

  useEffect(() => {
    if (!isLoggedIn) {
      setCartListingIds([]);
      return;
    }

    let active = true;

    const loadCart = async () => {
      try {
        const { data } = await api.get<CartResponse>("/cart");
        if (!active) return;

        setCartListingIds((data.items ?? []).map((item) => item.listingId));
      } catch {
        if (active) {
          setCartListingIds([]);
        }
      }
    };

    void loadCart();

    return () => {
      active = false;
    };
  }, [isLoggedIn, parsedGameId]);

  useEffect(() => {
    setSelectedListingId((current) => getSelectedListing(platformListings, current)?.id ?? null);
  }, [platformListings]);

  useEffect(() => {
    setSelectedImage(galleryImages[0] ?? coverImage);
  }, [coverImage, galleryImages]);

  const stepGalleryImage = (direction: -1 | 1) => {
    if (galleryImages.length <= 1) return;

    const currentImageIndex = Math.max(
      0,
      galleryImages.findIndex((imageUrl) => imageUrl === selectedImage),
    );
    const nextIndex =
      (currentImageIndex + direction + galleryImages.length) %
      galleryImages.length;

    setSelectedImage(galleryImages[nextIndex] ?? coverImage);
  };

  const syncCart = (listingId: number) => {
    setCartListingIds((current) =>
      current.includes(listingId) ? current : [...current, listingId],
    );
    window.dispatchEvent(new Event("nexus:counts-updated"));
  };

  const addCurrentListingToCart = async () => {
    if (!currentListingId || inCart) return;

    if (!isLoggedIn) {
      askLogin();
      return;
    }

    try {
      setActionError("");
      setBusyCart(true);
      await api.post(`/cart/${currentListingId}`, {});
      syncCart(currentListingId);
    } catch (cartError) {
      setActionError(
        getRequestErrorMessage(
          cartError,
          "Não foi possível adicionar o item ao carrinho.",
        ),
      );
    } finally {
      setBusyCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!currentListingId) return;

    if (!isLoggedIn) {
      askLogin();
      return;
    }

    try {
      setActionError("");
      setBusyBuyNow(true);

      if (!inCart) {
        await api.post(`/cart/${currentListingId}`, {});
        syncCart(currentListingId);
      }

      void navigate("/checkout");
    } catch (buyNowError) {
      setActionError(
        getRequestErrorMessage(
          buyNowError,
          "Não foi possível iniciar a compra agora.",
        ),
      );
    } finally {
      setBusyBuyNow(false);
    }
  };

  return (
    <>
      <AuthRequiredModal
        open={showAuthModal}
        title="Entre para continuar"
        message="Essa ação exige login. Deseja entrar agora?"
        onClose={closeAuthModal}
        onConfirm={goToLogin}
      />

      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-10 pt-28 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link
            to="/loja"
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-2 transition hover:border-blue-400/50 hover:text-blue-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para loja
          </Link>
          <h1 className="truncate text-3xl font-black text-white sm:text-4xl">
            {gameTitle}
          </h1>
        </div>

        {loading && (
          <div className="nexus-card mt-14 flex items-center justify-center gap-3 px-6 py-8 text-zinc-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando detalhes do jogo...
          </div>
        )}

        {!loading && error && (
          <section className="rounded-2xl border border-red-400/40 bg-red-950/30 p-6">
            <h1 className="text-2xl font-bold text-white">Falha ao carregar</h1>
            <p className="mt-2 text-red-200">{error}</p>
            <Link
              to="/loja"
              className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Voltar para loja
            </Link>
          </section>
        )}

        {!loading && !error && details && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_380px]">
            <div className="space-y-3">
              <DetailsGallery
                coverImage={coverImage}
                gameTitle={gameTitle}
                galleryImages={galleryImages}
                selectedImage={selectedImage}
                onSelectImage={setSelectedImage}
                onStepImage={stepGalleryImage}
              />

              <article className="nexus-panel relative overflow-hidden border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] p-5 sm:p-7">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent" />
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-cyan-200/80">
                  Sobre o jogo
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Explore o universo de {gameTitle}
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-100 sm:text-lg sm:leading-8">
                  {gameLongDescription}
                </p>
              </article>
            </div>

            <DetailsSidebar
              details={details}
              coverImage={coverImage}
              description={gameDescription}
              infoItems={infoItems}
              currentListingId={currentListingId}
              availableStock={availableStock}
              inCart={inCart}
              busyCart={busyCart}
              busyBuyNow={busyBuyNow}
              actionError={actionError}
              onSelectListing={(listingId) => {
                setSelectedListingId(listingId);
                setActionError("");
              }}
              onAddToCart={() => {
                void addCurrentListingToCart();
              }}
              onBuyNow={() => {
                void handleBuyNow();
              }}
            />
          </section>
        )}
      </main>
    </>
  );
}
