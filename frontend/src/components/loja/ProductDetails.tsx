import { CalendarDays, ChevronLeft, Loader2, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [cartListingIds, setCartListingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyCart, setBusyCart] = useState(false);
  const [busyBuyNow, setBusyBuyNow] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const platformListings = useMemo(() => details?.platformListings ?? [], [details?.platformListings]);
  const currentListing = useMemo(
    () => getSelectedListing(platformListings, selectedListingId),
    [platformListings, selectedListingId],
  );
  const currentListingId = Number(currentListing?.id ?? 0);
  const availableStock = getListingAvailableStock(currentListing);
  const coverImage = resolveAssetUrl(details?.coverImageUrl, "");
  const galleryImages = useMemo(() => {
    const resolvedImages = (details?.images ?? []).map((image) => ({
      ...image,
      imageUrl: resolveAssetUrl(image.imageUrl, ""),
    }));

    return getGalleryImages(coverImage, resolvedImages);
  }, [coverImage, details?.images]);
  const gameTitle = details?.title || "Detalhes do jogo";
  const gameDescription = details?.description || "Escolha sua plataforma e veja as opções disponíveis para este jogo.";
  const gameLongDescription = details?.longDescription || gameDescription;
  const reviewCount = Number(details?.reviewStats?.totalReviews ?? 0);
  const reviewAverage = Number(details?.reviewStats?.averageRating ?? 0);
  const inCart = currentListingId > 0 && cartListingIds.includes(currentListingId);
  const labels = [...(details?.categories ?? []), ...(details?.tags ?? [])];

  const infoItems = useMemo(
    () => [
      { label: "Lançamento", value: formatDate(details?.releaseDate), icon: CalendarDays },
      {
        label: "Avaliação",
        value: reviewCount === 0 ? "Ainda sem avaliações" : `${reviewAverage.toFixed(1)} / 5 (${reviewCount})`,
        icon: Star,
      },
    ],
    [details?.releaseDate, reviewAverage, reviewCount],
  );

  const askLogin = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const goToLogin = () => {
    closeAuthModal();
    void navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
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
        if (active) setDetails(data);
      } catch (loadError) {
        if (!active) return;
        setDetails(null);
        setError(getRequestErrorMessage(loadError, "Não foi possível carregar os detalhes do jogo."));
      } finally {
        if (active) setLoading(false);
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
        if (active) setCartListingIds((data.items ?? []).map((item) => item.listingId));
      } catch {
        if (active) setCartListingIds([]);
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
    const currentImageIndex = Math.max(0, galleryImages.findIndex((imageUrl) => imageUrl === selectedImage));
    const nextIndex = (currentImageIndex + direction + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[nextIndex] ?? coverImage);
  };

  const syncCart = (listingId: number) => {
    setCartListingIds((current) => (current.includes(listingId) ? current : [...current, listingId]));
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
      setActionError(getRequestErrorMessage(cartError, "Não foi possível adicionar o item ao carrinho."));
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
      setActionError(getRequestErrorMessage(buyNowError, "Não foi possível iniciar a compra agora."));
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

      <main id="conteudo-principal" className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <Link
          to="/loja"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para loja
        </Link>

        {loading && (
          <div className="mt-6 flex min-h-72 items-center justify-center gap-3 rounded-[28px] border border-slate-800 bg-slate-950/70 px-6 py-8 text-slate-300" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" aria-hidden="true" />
            Carregando detalhes do jogo...
          </div>
        )}

        {!loading && error && (
          <section className="mt-6 rounded-[28px] border border-rose-400/30 bg-rose-950/30 p-6 sm:p-8">
            <h1 className="text-2xl font-black text-white">Falha ao carregar</h1>
            <p className="mt-2 text-rose-200">{error}</p>
            <Link to="/loja" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
              Voltar para loja
            </Link>
          </section>
        )}

        {!loading && !error && details && (
          <>
            <section className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.38fr)_minmax(320px,0.62fr)]" aria-labelledby="game-title">
              <DetailsGallery
                coverImage={coverImage}
                gameTitle={gameTitle}
                galleryImages={galleryImages}
                selectedImage={selectedImage}
                onSelectImage={setSelectedImage}
                onStepImage={stepGalleryImage}
              />

              <article className="relative min-w-0 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 p-6 sm:p-8">
                  <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
                  <h1 id="game-title" className="relative max-w-[14ch] text-4xl font-black leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl">
                    {gameTitle}
                  </h1>
                  <p className="relative mt-5 text-base leading-7 text-slate-300">{gameDescription}</p>

                  {labels.length > 0 && (
                    <div className="relative mt-6 flex flex-wrap gap-2">
                      {labels.map((item) => (
                        <span key={`${item.name}-${item.id}`} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <dl className="relative mt-7 grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {infoItems.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex min-w-0 items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                        <div className="min-w-0">
                          <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
                          <dd className="mt-1 truncate text-sm font-semibold text-slate-200">{value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
              </article>

              <div className="min-w-0 lg:col-start-2 lg:row-start-2">
                <DetailsSidebar
                  details={details}
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
                  onAddToCart={() => void addCurrentListingToCart()}
                  onBuyNow={() => void handleBuyNow()}
                />
              </div>

              <article className="rounded-[28px] border border-slate-800 bg-slate-950 p-6 sm:p-8 lg:col-start-1 lg:row-start-2" aria-labelledby="about-game-title">
                <div className="max-w-3xl">
                  <h2 id="about-game-title" className="text-2xl font-black tracking-[-0.025em] text-white sm:text-3xl">Sobre {gameTitle}</h2>
                  <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-300">{gameLongDescription}</p>
                </div>
              </article>
            </section>
          </>
        )}
      </main>
    </>
  );
}
