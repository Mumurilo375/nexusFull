import type { KeyboardEvent, MouseEvent } from "react";
import { Heart } from "lucide-react";
import { resolveAssetUrl, resolvePlatformLogoUrl } from "../../services/assets";
import type { CartFeedback, GameSummary, ListingItem } from "./store.types";
import { clampTextStyle, getListingAvailableStock } from "./store.utils";

type ProductCardProps = {
  game: GameSummary;
  listings: ListingItem[];
  selectedListing: ListingItem | null;
  showOfferPricing?: boolean;
  inCart: boolean;
  isFavorite: boolean;
  pendingFavorite: boolean;
  pendingCart: boolean;
  feedback?: CartFeedback | null;
  onOpen: (gameId: number) => void;
  onToggleFavorite: (gameId: number) => void;
  onSelectListing: (gameId: number, listingId: number) => void;
  onAddToCart: (gameId: number, listingId: number) => void;
};

export default function ProductCard({
  game,
  listings,
  selectedListing,
  showOfferPricing = false,
  inCart,
  isFavorite,
  pendingFavorite,
  pendingCart,
  feedback,
  onOpen,
  onToggleFavorite,
  onSelectListing,
  onAddToCart,
}: ProductCardProps) {
  const formatMoney = (value: number) => `R$ ${value.toFixed(2)}`;
  const selectedListingHasStockInfo = Boolean(selectedListing?.stock);
  const selectedListingAvailableStock = getListingAvailableStock(selectedListing);
  const selectedListingIsOutOfStock =
    selectedListingHasStockInfo && selectedListingAvailableStock <= 0;
  const selectedListingDiscountPercentage = Number(
    selectedListing?.pricing?.discountPercentage ?? 0,
  );
  const selectedListingBasePrice = Number(
    selectedListing?.pricing?.basePrice ?? selectedListing?.price ?? 0,
  );
  const selectedListingFinalPrice = Number(
    selectedListing?.pricing?.finalPrice ?? selectedListing?.price ?? 0,
  );
  const selectedListingHasOfferDiscount =
    showOfferPricing && selectedListingDiscountPercentage > 0;
  const selectedListingPriceIsValid =
    Boolean(selectedListing) &&
    Number.isFinite(selectedListingFinalPrice) &&
    selectedListingFinalPrice > 0;
  const selectedListingPlatformName = selectedListing?.platform?.name || "Plataforma";
  const priceLabel = selectedListing
    ? selectedListingPriceIsValid
      ? formatMoney(selectedListingFinalPrice)
      : "Preço indisponível"
    : "Escolha a plataforma";
  const categoryLabel =
    game.categories?.slice(0, 2).map((category) => category.name).join(" • ") ||
    "Sem categoria";

  const stopCardNavigation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpen(game.id);
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => onOpen(game.id)}
      onKeyDown={handleCardKeyDown}
      className="nexus-card relative my-1 flex cursor-pointer flex-col items-start gap-4 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-slate-600"
    >
      <button
        type="button"
        onMouseDown={stopCardNavigation}
        onClick={(event) => {
          stopCardNavigation(event);
          onToggleFavorite(game.id);
        }}
        disabled={pendingFavorite}
        className="absolute left-4 top-4 z-20 rounded-full border border-slate-700 bg-slate-950/90 p-2.5 transition hover:border-slate-500 disabled:opacity-60"
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={isFavorite ? "fill-red-500 text-red-500" : "text-slate-100"} />
      </button>

      <div className="flex h-56 w-full items-center justify-center rounded-[22px] border border-slate-800 bg-black/20 p-3 sm:h-60">
        <img
          src={resolveAssetUrl(game.coverImageUrl)}
          alt={game.title}
          className="max-h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-200/80">
          {categoryLabel}
        </p>
        <h2 className="text-left text-xl font-bold leading-tight text-white line-clamp-2">
          {game.title}
        </h2>
      </div>

      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              {selectedListing ? selectedListingPlatformName : "Selecione uma plataforma"}
            </p>
            {selectedListingHasOfferDiscount && (
              <p className="mt-2 text-xs text-slate-500 line-through">
                {formatMoney(selectedListingBasePrice)}
              </p>
            )}
            <p className="mt-1 text-2xl font-black text-white">{priceLabel}</p>
          </div>

          {selectedListingHasOfferDiscount && (
            <span className="shrink-0 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
              -{selectedListingDiscountPercentage}%
            </span>
          )}
        </div>

        {selectedListingHasStockInfo && (
          <p
            className={`mt-3 text-xs font-semibold ${
              selectedListingIsOutOfStock ? "text-rose-200" : "text-emerald-200"
            }`}
          >
            {selectedListingIsOutOfStock
              ? "Plataforma indisponível no momento."
              : `Estoque disponível: ${selectedListingAvailableStock}`}
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onMouseDown={stopCardNavigation}
          onClick={(event) => {
            stopCardNavigation(event);
            if (!selectedListing || selectedListingIsOutOfStock) {
              return;
            }

            onAddToCart(game.id, selectedListing.id);
          }}
          disabled={!selectedListing || inCart || pendingCart || selectedListingIsOutOfStock}
          className={`w-full rounded-full px-4 py-3 text-sm font-bold text-white transition disabled:opacity-75 ${
            selectedListingIsOutOfStock
              ? "cursor-not-allowed border border-rose-500/40 bg-rose-500/10 text-rose-100"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {!selectedListing
            ? "Escolha uma plataforma"
            : inCart
              ? "Já está no carrinho"
              : selectedListingIsOutOfStock
                ? "Sem estoque"
                : pendingCart
                  ? "Adicionando..."
                  : "Adicionar ao carrinho"}
        </button>

        <div className="rounded-2xl border border-slate-800/80 bg-black/15 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Plataforma
          </p>
          <div className="flex flex-wrap gap-2">
            {listings.map((listing) => {
              const selected = selectedListing?.id === listing.id;
              const listingIsOutOfStock =
                Boolean(listing.stock) && getListingAvailableStock(listing) <= 0;

              return (
                <button
                  key={listing.id}
                  type="button"
                  onMouseDown={stopCardNavigation}
                  onClick={(event) => {
                    stopCardNavigation(event);
                    onSelectListing(game.id, listing.id);
                  }}
                  className={`rounded-xl border px-2 py-2 transition ${
                    selected
                      ? listingIsOutOfStock
                        ? "border-rose-400/70 bg-rose-500/10"
                        : "border-blue-400/70 bg-blue-500/15"
                      : listingIsOutOfStock
                        ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-400/60"
                        : "border-slate-700 bg-slate-950/85 hover:border-slate-500"
                  }`}
                  title={listing.platform?.name || "Plataforma"}
                  aria-pressed={selected}
                  aria-label={`Selecionar ${listing.platform?.name || "plataforma"}`}
                >
                  <img
                    src={resolvePlatformLogoUrl(listing.platform?.name)}
                    alt=""
                    className={`h-8 w-8 object-contain ${listingIsOutOfStock ? "opacity-55" : ""}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <p className="border-t border-slate-800/80 pt-3 text-sm text-gray-300" style={clampTextStyle}>
          {game.description}
        </p>

        {feedback && (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.tone === "error"
                ? "border-rose-500/35 bg-rose-500/10 text-rose-100"
                : "border-blue-500/25 bg-blue-500/10 text-blue-100"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </article>
  );
}
