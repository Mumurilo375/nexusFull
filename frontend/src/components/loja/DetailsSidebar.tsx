import { BadgePercent, Check, CircleAlert, ShoppingCart } from "lucide-react";
import { resolvePlatformLogoUrl } from "../../services/assets";
import type { GameDetails } from "./store.types";
import { getListingDisplayPrice, toMoney } from "./store.utils";

type DetailsSidebarProps = {
  details: GameDetails;
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
  const canPurchase = Boolean(currentListing) && availableStock > 0;

  return (
    <aside className="rounded-[28px] border border-slate-700 bg-slate-900 p-5 shadow-[0_18px_48px_rgba(2,6,23,0.28)] sm:p-6" aria-labelledby="platform-title">
      <h2 id="platform-title" className="text-2xl font-black tracking-[-0.025em] text-white">Escolha sua plataforma</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">A plataforma define o preço, o estoque e a key simulada deste pedido.</p>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-slate-200">Disponível para</legend>
        {details.platformListings && details.platformListings.length > 0 ? (
          <div className="grid gap-2">
            {details.platformListings.map((listing) => {
              const selected = Number(listing.id) === currentListingId;
              const platformName = listing.platform?.name || "Plataforma";

              return (
                <button
                  key={`platform-${listing.id}`}
                  type="button"
                  onClick={() => onSelectListing(Number(listing.id))}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-blue-400 bg-blue-500/15 text-white"
                      : "border-slate-700 bg-slate-950/70 text-slate-200 hover:border-slate-500 hover:bg-slate-950"
                  }`}
                  aria-pressed={selected}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1.5">
                    <img src={resolvePlatformLogoUrl(platformName, listing.platform?.iconUrl)} alt="" className="max-h-full max-w-full object-contain" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{platformName}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{toMoney(getListingDisplayPrice(listing))}</span>
                  </span>
                  {selected && <Check className="h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-4 text-sm leading-6 text-slate-400">
            Nenhuma plataforma disponível para este jogo no momento.
          </p>
        )}
      </fieldset>

      <div className="mt-6 border-t border-slate-700 pt-5">
        {currentListing ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-400">Preço final</p>
                {discountPercentage > 0 && <p className="mt-1 text-sm text-slate-500 line-through">{toMoney(basePrice)}</p>}
                <p className="mt-1 text-4xl font-black tracking-tight text-white">{toMoney(finalPrice)}</p>
              </div>
              {discountPercentage > 0 && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-400/15 px-2.5 py-1.5 text-xs font-bold text-emerald-200">
                  <BadgePercent className="h-3.5 w-3.5" aria-hidden="true" />
                  -{discountPercentage}%
                </span>
              )}
            </div>

            <p className={`mt-4 text-sm font-semibold ${availableStock <= 0 ? "text-rose-200" : "text-emerald-200"}`} role="status">
              {availableStock <= 0 ? "Esta plataforma está sem estoque." : `${availableStock} unidades disponíveis.`}
            </p>

            {activePromotions.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-emerald-200">
                {activePromotions.map((promotion) => <li key={`promo-${promotion.id}`}>{promotion.name || "Oferta especial"} aplicada ao preço.</li>)}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">Configure uma plataforma para visualizar preço e disponibilidade.</p>
        )}
      </div>

      <div className="mt-6 grid gap-2">
        <button
          type="button"
          onClick={onBuyNow}
          disabled={busyBuyNow || busyCart || !canPurchase}
          className="min-h-12 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busyBuyNow ? "Preparando checkout..." : "Comprar agora"}
        </button>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={busyCart || busyBuyNow || inCart || !canPurchase}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 font-bold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {inCart ? "Já está no carrinho" : busyCart ? "Adicionando..." : "Adicionar ao carrinho"}
        </button>
      </div>

      <div className="mt-5 flex items-start gap-2 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/80" aria-hidden="true" />
        <p>Compra simulada para fins acadêmicos. A key é entregue após a confirmação do pedido.</p>
      </div>

      {actionError && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-sm text-rose-200" role="alert">{actionError}</p>}
    </aside>
  );
}
