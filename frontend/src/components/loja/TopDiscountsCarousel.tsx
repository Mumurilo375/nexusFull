import { BadgePercent, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { resolveAssetUrl } from "../../services/assets";
import { toMoney } from "./store.utils";

export type TopDiscountsCarouselItem = {
  id: number;
  title: string;
  coverImageUrl?: string;
  discountPercentage: number;
  finalPrice: number;
};

type TopDiscountsCarouselProps = {
  items: TopDiscountsCarouselItem[];
  onOpen: (gameId: number) => void;
};

function TopDiscountsCarouselCard({
  item,
  onOpen,
}: {
  item: TopDiscountsCarouselItem;
  onOpen: (gameId: number) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item.id);
        }
      }}
      className="group relative min-w-[68%] max-h-[360px] cursor-pointer snap-start overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-slate-950/85 hover:shadow-[0_18px_45px_rgba(16,185,129,0.14)] sm:min-w-[40%] lg:min-w-[28%] xl:min-w-[22%]"
    >
      <div className="relative aspect-4/3 max-h-[220px] overflow-hidden bg-black/40 sm:max-h-[240px] lg:max-h-[260px]">
        <img
          src={resolveAssetUrl(item.coverImageUrl)}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/15 to-transparent transition-opacity duration-300 group-hover:from-slate-950/95 group-hover:via-slate-950/25" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-lg font-extrabold text-white line-clamp-2 transition-transform duration-300 group-hover:-translate-y-px">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100 transition duration-300 group-hover:border-emerald-400/60 group-hover:bg-emerald-500/15 group-hover:shadow-[0_0_0_1px_rgba(74,222,128,0.14)]">
          <BadgePercent className="h-4 w-4" />-{item.discountPercentage}%
        </span>
        <span className="text-sm font-semibold text-slate-100 transition duration-300 group-hover:text-white">
          {toMoney(item.finalPrice)}
        </span>
      </div>
    </article>
  );
}

export default function TopDiscountsCarousel({
  items,
  onOpen,
}: TopDiscountsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const hasItems = items.length > 0;

  const scrollCarousel = (direction: -1 | 1) => {
    const element = carouselRef.current;
    if (!element) {
      return;
    }

    const scrollAmount = Math.max(280, Math.round(element.clientWidth * 0.82));
    element.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="nexus-panel relative mb-6 overflow-hidden p-4 sm:p-6">
      <div className="pointer-events-none absolute -left-20 -top-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative z-10 mb-4 px-12 text-center">
        <h2 className="text-2xl font-black text-white sm:text-3xl">
          Em Oferta
        </h2>
      </div>

      <div className="relative z-10">
        <button
          type="button"
          onClick={() => scrollCarousel(-1)}
          disabled={!hasItems}
          className="absolute left-0 top-1/2 z-20 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 p-2 text-slate-100 shadow-lg transition hover:border-slate-500 hover:bg-slate-900/95 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => scrollCarousel(1)}
          disabled={!hasItems}
          className="absolute right-0 top-1/2 z-20 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 p-2 text-slate-100 shadow-lg transition hover:border-slate-500 hover:bg-slate-900/95 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Proximo slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={carouselRef}
          className="nexus-scrollbar relative z-10 -mx-1 flex gap-4 overflow-x-auto px-1 pb-3 scroll-smooth snap-x snap-mandatory"
        >
          {hasItems ? (
            items.map((item) => (
              <TopDiscountsCarouselCard
                key={item.id}
                item={item}
                onOpen={onOpen}
              />
            ))
          ) : (
            <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/60 px-5 py-8 text-center text-sm text-slate-300">
              Nenhuma oferta ativa no momento.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
