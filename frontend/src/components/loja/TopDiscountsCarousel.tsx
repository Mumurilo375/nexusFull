import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

export default function TopDiscountsCarousel({
  items,
  onOpen,
}: TopDiscountsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;

    const updateScrollState = () => {
      setCanScroll(element.scrollWidth > element.clientWidth + 1);
    };

    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(element);

    return () => observer.disconnect();
  }, [items.length]);

  if (items.length === 0) return null;

  const scrollCarousel = (direction: -1 | 1) => {
    const element = carouselRef.current;
    if (!element || !canScroll) return;

    element.scrollBy({
      left: direction * Math.round(element.clientWidth * 0.75),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <section aria-labelledby="discounted-games-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 id="discounted-games-title" className="text-xl font-black text-white sm:text-2xl">
            Em oferta
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Maiores descontos ativos no catálogo.
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            disabled={!canScroll}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Voltar nas ofertas"
            aria-controls="carrossel-ofertas"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            disabled={!canScroll}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Avançar nas ofertas"
            aria-controls="carrossel-ofertas"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        id="carrossel-ofertas"
        className="grid grid-cols-2 gap-3 md:flex md:overflow-x-auto md:pb-2"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            aria-label={`Abrir detalhes de ${item.title}`}
            className={`group min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-left transition hover:border-emerald-400/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 md:w-60 md:shrink-0 ${
              index >= 4 ? "hidden md:block" : ""
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
              <img
                src={resolveAssetUrl(item.coverImageUrl)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute left-2 top-2 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                -{item.discountPercentage}%
              </span>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold leading-5 text-white line-clamp-2 sm:text-base">
                {item.title}
              </h3>
              <div className="mt-3 flex items-end justify-between gap-2">
                <span className="text-sm font-bold text-emerald-200">
                  {toMoney(item.finalPrice)}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-emerald-300" aria-hidden="true" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
