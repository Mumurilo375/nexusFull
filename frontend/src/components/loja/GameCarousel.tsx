import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  resolveAssetUrl,
  resolvePlatformLogoUrl,
} from "../../services/assets";

export type GameCarouselItem = {
  id: number;
  title: string;
  coverImageUrl?: string;
  priceLabel: string;
  detailLabel?: string;
  badgeLabel?: string;
  platforms?: string[];
};

type GameCarouselProps = {
  carouselId: string;
  title: string;
  description: string;
  items: GameCarouselItem[];
  accent: "cyan" | "emerald";
  onOpen: (gameId: number) => void;
  viewAllTo?: string;
  viewAllLabel?: string;
};

const accentClasses = {
  cyan: {
    border: "hover:border-cyan-400/55",
    focus: "focus-visible:ring-cyan-300",
    price: "text-cyan-200",
    arrow: "group-hover:text-cyan-300",
    badge: "border-cyan-300/30 bg-cyan-400/15 text-cyan-100",
  },
  emerald: {
    border: "hover:border-emerald-400/55",
    focus: "focus-visible:ring-emerald-300",
    price: "text-emerald-200",
    arrow: "group-hover:text-emerald-300",
    badge: "border-emerald-300/35 bg-emerald-700 text-white",
  },
} as const;

function PlatformBadges({ platforms }: { platforms: string[] }) {
  if (platforms.length === 0) return null;

  return (
    <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
      {platforms.slice(0, 2).map((platform) => {
        const logoUrl = resolvePlatformLogoUrl(platform, null, "");

        return (
          <span
            key={platform}
            className="inline-flex h-7 max-w-28 items-center gap-1.5 rounded-lg border border-slate-600/80 bg-slate-950/90 px-2 text-[11px] font-semibold text-slate-100"
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt=""
                className="h-3.5 w-3.5 shrink-0 object-contain"
                loading="lazy"
                decoding="async"
              />
            )}
            <span className="truncate">{platform}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function GameCarousel({
  carouselId,
  title,
  description,
  items,
  accent,
  onOpen,
  viewAllTo,
  viewAllLabel = "Ver todos",
}: GameCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollBackward, setCanScrollBackward] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const classes = accentClasses[accent];
  const titleId = `${carouselId}-title`;

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;

    const updateScrollState = () => {
      const maximumScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);

      setCanScrollBackward(element.scrollLeft > 1);
      setCanScrollForward(element.scrollLeft < maximumScrollLeft - 1);
    };

    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(element);
    element.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", updateScrollState);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  const scrollCarousel = (direction: -1 | 1) => {
    const element = carouselRef.current;
    const canScrollInDirection =
      direction === -1 ? canScrollBackward : canScrollForward;

    if (!element || !canScrollInDirection) return;

    element.scrollBy({
      left: direction * Math.round(element.clientWidth * 0.78),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2
            id={titleId}
            className="text-balance text-2xl font-black tracking-[-0.025em] text-white sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="hidden min-h-11 items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200 sm:inline-flex"
            >
              {viewAllLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            disabled={!canScrollBackward}
            className="hidden min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 md:inline-flex"
            aria-label={`Voltar em ${title.toLowerCase()}`}
            aria-controls={carouselId}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            disabled={!canScrollForward}
            className="hidden min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 md:inline-flex"
            aria-label={`Avançar em ${title.toLowerCase()}`}
            aria-controls={carouselId}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        id={carouselId}
        role="region"
        aria-label={title}
        tabIndex={canScrollBackward || canScrollForward ? 0 : undefined}
        className="nexus-shelf -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:px-0"
      >
        {items.map((item) => {
          const platforms = (item.platforms ?? []).filter(Boolean);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item.id)}
              aria-label={`Abrir detalhes de ${item.title}`}
              className={`group w-[10.75rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-left transition duration-300 hover:-translate-y-1 ${classes.border} focus-visible:outline-none focus-visible:ring-2 ${classes.focus} sm:w-52 lg:w-56`}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                <img
                  src={resolveAssetUrl(item.coverImageUrl)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(2,6,23,0.82)_100%)]"
                  aria-hidden="true"
                />
                {item.badgeLabel && (
                  <span
                    className={`absolute left-3 top-3 rounded-lg border px-2 py-1 text-xs font-black ${classes.badge}`}
                  >
                    {item.badgeLabel}
                  </span>
                )}
                <PlatformBadges platforms={platforms} />
              </div>

              <div className="p-3.5 sm:p-4">
                {item.detailLabel && (
                  <p className="mb-1.5 truncate text-xs font-semibold text-slate-400">
                    {item.detailLabel}
                  </p>
                )}
                <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-white sm:text-base">
                  {item.title}
                </h3>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <span className={`text-sm font-black sm:text-base ${classes.price}`}>
                    {item.priceLabel}
                  </span>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 text-slate-600 transition ${classes.arrow}`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-xl px-1 py-2 text-sm font-bold text-blue-300 transition hover:text-blue-200 sm:hidden"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
