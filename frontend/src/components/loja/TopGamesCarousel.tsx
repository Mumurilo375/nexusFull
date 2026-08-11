import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { resolveAssetUrl } from "../../services/assets";
import { toMoney } from "./store.utils";

export type TopGamesCarouselItem = {
  id: number;
  title: string;
  coverImageUrl?: string;
  soldCount: number;
  lowestPrice: number | null;
  categories: string[];
};

type TopGamesCarouselProps = {
  items: TopGamesCarouselItem[];
  hasSales: boolean;
  onOpen: (gameId: number) => void;
};

function formatPriceLabel(price: number | null) {
  return price !== null ? `A partir de ${toMoney(price)}` : "Preço indisponível";
}

export default function TopGamesCarousel({
  items,
  hasSales,
  onOpen,
}: TopGamesCarouselProps) {
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
    <section aria-labelledby="top-games-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 id="top-games-title" className="text-xl font-black text-white sm:text-2xl">
            {hasSales ? "Mais vendidos" : "Jogos em destaque"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Uma seleção rápida para continuar explorando.
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            disabled={!canScroll}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Voltar nos jogos em destaque"
            aria-controls="carrossel-mais-vendidos"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            disabled={!canScroll}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Avançar nos jogos em destaque"
            aria-controls="carrossel-mais-vendidos"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        id="carrossel-mais-vendidos"
        className="grid grid-cols-2 gap-3 md:flex md:overflow-x-auto md:pb-2"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            aria-label={`Abrir detalhes de ${item.title}`}
            className={`group min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-left transition hover:border-cyan-400/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 md:w-60 md:shrink-0 ${
              index >= 4 ? "hidden md:block" : ""
            }`}
          >
            <div className="aspect-[4/3] overflow-hidden bg-slate-900">
              <img
                src={resolveAssetUrl(item.coverImageUrl)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold leading-5 text-white line-clamp-2 sm:text-base">
                {item.title}
              </h3>
              <div className="mt-3 flex items-end justify-between gap-2">
                <span className="text-xs font-semibold text-cyan-200 sm:text-sm">
                  {formatPriceLabel(item.lowestPrice)}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-300" aria-hidden="true" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
