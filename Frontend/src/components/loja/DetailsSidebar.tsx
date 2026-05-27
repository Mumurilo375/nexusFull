import { BadgePercent, ShoppingCart } from "lucide-react";
import type { GameDetails } from "./store.types";
import { getListingDisplayPrice, toMoney } from "./store.utils";

type DetailsSidebarProps = {
  details: GameDetails;
  coverImage: string;
  description: string;
  infoItems: Array<{ label: string; value: string }>;
  currentListingId: number;
  availableStock: number;
  inCart: boolean;
  busyCart: boolean;
  busyBuyNow: boolean;
  actionError: string;
  onSelectListing: (listingId: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export default function DetailsSidebar({
  details,
  coverImage,
  description,
  infoItems,
  currentListingId,
  availableStock,
  inCart,
  busyCart,
  busyBuyNow,
  actionError,
  onSelectListing,
  onAddToCart,
  onBuyNow,
}: DetailsSidebarProps) {
  const currentListing =
    details.platformListings?.find((listing) => Number(listing.id) === currentListingId) ??
    details.platformListings?.[0] ??
    null;
  const pricing = currentListing?.pricing ?? {};
  const basePrice = Number(pricing.basePrice ?? currentListing?.price ?? 0);
  const finalPrice = Number(pricing.finalPrice ?? basePrice);
  const discountPercentage = Number(pricing.discountPercentage ?? 0);
  const activePromotions = currentListing?.activePromotions ?? [];
  const labels = [...(details.categories ?? []), ...(details.tags ?? [])];

  return (
    <aside className="nexus-panel p-5 sm:p-6 lg:sticky lg:top-28 lg:h-fit">
      <div className="overflow-hidden border border-white/10 bg-slate-950/70">
        <img
          src={coverImage}
          alt={`${details.title || "Jogo"} capa`}
          className="aspect-video w-full object-cover"
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{description}</p>

      <div className="mt-4 space-y-2 text-sm text-zinc-300">
        {infoItems.map((item) => (
          <p key={item.label}>
            <span className="font-semibold text-zinc-100">{item.label}:</span>{" "}
            <span className="text-zinc-300">{item.value}</span>
          </p>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {labels.map((item) => (
          <span
            key={`${item.name}-${item.id}`}
            className="rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100"
          >
            {item.name}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
        {currentListing ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                {discountPercentage > 0 && (
                  <p className="text-sm text-zinc-400 line-through">{toMoney(basePrice)}</p>
                )}
                <p className="text-3xl font-black text-blue-200">{toMoney(finalPrice)}</p>
              </div>

              {discountPercentage > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  <BadgePercent className="h-3.5 w-3.5" />-{discountPercentage}%
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-zinc-300">Estoque disponível: {availableStock}</p>

            {availableStock <= 0 && (
              <p className="mt-2 text-sm font-semibold text-red-300">
                Esta plataforma está sem estoque no momento.
              </p>
            )}

            {activePromotions.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-emerald-200">
                {activePromotions.map((promotion) => (
                  <li key={`promo-${promotion.id}`}>
                    Promoção ativa: {promotion.name || "Oferta especial"}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-300">
            Nenhuma plataforma disponível para este jogo no momento.
          </p>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-zinc-200">Escolha a plataforma</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(details.platformListings ?? []).map((listing) => {
            const selected = Number(listing.id) === currentListingId;

            return (
              <button
                key={`platform-${listing.id}`}
                type="button"
                onClick={() => onSelectListing(Number(listing.id))}
                className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${
                  selected
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-white/12 bg-black/40 text-zinc-200 hover:border-blue-300/50"
                }`}
              >
                <p className="font-semibold">{listing.platform?.name || "Plataforma"}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {toMoney(getListingDisplayPrice(listing))}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={busyCart || inCart || availableStock <= 0 || !currentListing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500 disabled:opacity-60"
        >
          <ShoppingCart className="h-4 w-4" />
          {inCart
            ? "Já está no carrinho"
            : busyCart
              ? "Adicionando..."
              : "Adicionar ao carrinho"}
        </button>

        <button
          type="button"
          onClick={onBuyNow}
          disabled={busyBuyNow || availableStock <= 0 || !currentListing}
          className="rounded-xl border border-cyan-300/50 bg-cyan-500/15 px-4 py-3 font-bold text-cyan-100 transition hover:bg-cyan-500/25 disabled:opacity-60"
        >
          {busyBuyNow ? "Processando..." : "Comprar agora"}
        </button>
      </div>

      {actionError && <p className="mt-3 text-sm text-red-300">{actionError}</p>}
    </aside>
  );
}
