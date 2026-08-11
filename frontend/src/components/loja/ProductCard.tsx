import { ArrowRight, ChevronDown, Heart, ShoppingCart } from "lucide-react";
import { resolveAssetUrl, resolvePlatformLogoUrl } from "../../services/assets";
import type { CartFeedback, GameSummary, ListingItem } from "./store.types";
import { getListingAvailableStock } from "./store.utils";

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
  const priceLabel = selectedListing
    ? selectedListingPriceIsValid
      ? formatMoney(selectedListingFinalPrice)
      : "Preço indisponível"
    : "Selecione a plataforma";
  const categoryLabel = game.categories?.[0]?.name || "Sem categoria";
  const selectedPlatformName = selectedListing?.platform?.name || "";

  return (
    <article className="nexus-motion nexus-card group/card relative flex min-w-0 flex-col overflow-hidden transition duration-200 hover:border-slate-500">
      <div className="relative border-b border-slate-800 bg-slate-950">
        <button
          type="button"
          onClick={() => onOpen(game.id)}
          className="flex aspect-[16/10] w-full items-center justify-center p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-inset"
          aria-label={`Abrir detalhes de ${game.title}`}
        >
          <img
            src={resolveAssetUrl(game.coverImageUrl)}
            alt={`Capa de ${game.title}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition duration-300 group-hover/card:scale-[1.02]"
          />
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(game.id)}
          disabled={pendingFavorite}
          className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/95 text-slate-100 transition hover:border-slate-500 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-60"
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={isFavorite}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-blue-200">{categoryLabel}</p>
        <button
          type="button"
          onClick={() => onOpen(game.id)}
          className="mt-1 min-h-11 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <h3 className="text-xl font-bold leading-tight text-white line-clamp-2">
            {game.title}
          </h3>
        </button>

        <div className="mt-4">
          <label
            htmlFor={`platform-${game.id}`}
            className="mb-2 block text-xs font-semibold text-slate-400"
          >
            Plataforma
          </label>
          <div className="relative">
            {selectedPlatformName && (
              <img
                src={resolvePlatformLogoUrl(selectedPlatformName)}
                alt=""
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 object-contain"
              />
            )}
            <select
              id={`platform-${game.id}`}
              value={selectedListing?.id ?? ""}
              onChange={(event) => onSelectListing(game.id, Number(event.target.value))}
              disabled={listings.length === 0}
              className={`min-h-11 w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-2 pr-10 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                selectedPlatformName ? "pl-10" : "pl-3"
              }`}
            >
              <option value="" disabled>
                {listings.length > 0 ? "Escolha uma plataforma" : "Sem plataformas"}
              </option>
              {listings.map((listing) => {
                const platformName = listing.platform?.name || "Plataforma";
                const isOutOfStock =
                  Boolean(listing.stock) && getListingAvailableStock(listing) <= 0;

                return (
                  <option key={listing.id} value={listing.id}>
                    {platformName}{isOutOfStock ? " — sem estoque" : ""}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
          </div>
        </div>

        {selectedListing && (
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-800 pt-4">
            <div className="min-w-0">
              {selectedListingHasOfferDiscount && (
                <p className="text-xs text-slate-500 line-through">
                  {formatMoney(selectedListingBasePrice)}
                </p>
              )}
              <p className="text-xl font-black text-white">{priceLabel}</p>
              <p
                className={`mt-1 text-xs font-semibold ${
                  selectedListingIsOutOfStock ? "text-rose-200" : "text-emerald-200"
                }`}
              >
                {selectedListingIsOutOfStock
                  ? "Sem estoque"
                  : selectedListingHasStockInfo
                    ? `${selectedListingAvailableStock} disponíveis`
                    : "Disponível"}
              </p>
            </div>

            {selectedListingHasOfferDiscount && (
              <span className="shrink-0 rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-200">
                -{selectedListingDiscountPercentage}%
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!selectedListing) {
              onOpen(game.id);
            } else if (!selectedListingIsOutOfStock) {
              onAddToCart(game.id, selectedListing.id);
            }
          }}
          disabled={Boolean(selectedListing) && (inCart || pendingCart || selectedListingIsOutOfStock)}
          className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-65 ${
            selectedListingIsOutOfStock
              ? "border border-rose-500/40 bg-rose-500/10 text-rose-100"
              : selectedListing
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "border border-slate-600 bg-slate-950 text-slate-100 hover:border-slate-400 hover:bg-slate-900"
          }`}
        >
          {selectedListing ? (
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
          {!selectedListing
            ? "Ver detalhes"
            : inCart
              ? "No carrinho"
              : selectedListingIsOutOfStock
                ? "Sem estoque"
                : pendingCart
                  ? "Adicionando..."
                  : "Adicionar ao carrinho"}
        </button>

        {feedback && (
          <p
            role={feedback.tone === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`mt-3 border-t pt-3 text-sm ${
              feedback.tone === "error"
                ? "border-rose-500/30 text-rose-200"
                : feedback.tone === "success"
                  ? "border-emerald-500/30 text-emerald-200"
                  : "border-blue-500/25 text-blue-200"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </article>
  );
}
