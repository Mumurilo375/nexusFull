import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OfferItem } from "../../pages/offers.types";
import api from "../../services/api";
import type { PaginatedResponse } from "../../services/http";
import {
  buildDiscountedCarousel,
  buildFeaturedCarousel,
} from "../loja/catalogShowcase";
import { loadCatalogData } from "../loja/catalogData";
import type { TopDiscountsCarouselItem } from "../loja/TopDiscountsCarousel";
import TopDiscountsCarousel from "../loja/TopDiscountsCarousel";
import type { TopGamesCarouselItem } from "../loja/TopGamesCarousel";
import TopGamesCarousel from "../loja/TopGamesCarousel";
import { buildCatalogState } from "../loja/store.utils";

type ShowcaseData = {
  featuredItems: TopGamesCarouselItem[];
  discountedItems: TopDiscountsCarouselItem[];
  hasSales: boolean;
  catalogFailed: boolean;
  offersFailed: boolean;
  allRequestsFailed: boolean;
};

const initialData: ShowcaseData = {
  featuredItems: [],
  discountedItems: [],
  hasSales: false,
  catalogFailed: false,
  offersFailed: false,
  allRequestsFailed: false,
};

function ShowcaseSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando destaques da loja...</span>
      <div className="h-8 w-64 max-w-full rounded-lg bg-slate-800" />
      <div className="mt-3 h-5 w-96 max-w-full rounded-lg bg-slate-900" />
      <div className="mt-6 flex gap-3 overflow-hidden sm:gap-4" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="w-[10.75rem] shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 sm:w-52 lg:w-56"
          >
            <div className="aspect-[3/4] bg-slate-900" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-4/5 rounded bg-slate-800" />
              <div className="h-5 w-3/5 rounded bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeShowcase() {
  const navigate = useNavigate();
  const [data, setData] = useState<ShowcaseData>(initialData);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const loadShowcase = async () => {
      setLoading(true);

      const [catalogResult, offersResult] = await Promise.allSettled([
        loadCatalogData(),
        api.get<PaginatedResponse<OfferItem>>("/promotions", {
          params: { page: 1, limit: 100, activeNow: true },
        }),
      ]);

      if (!isCurrent) return;

      const nextData: ShowcaseData = { ...initialData };
      nextData.catalogFailed = catalogResult.status === "rejected";
      nextData.offersFailed = offersResult.status === "rejected";

      if (catalogResult.status === "fulfilled") {
        const catalog = buildCatalogState(
          catalogResult.value.games,
          catalogResult.value.listings.filter((listing) => listing.isActive !== false),
        );
        const featured = buildFeaturedCarousel(catalog.games, catalog.listingByGame);

        nextData.featuredItems = featured.items;
        nextData.hasSales = featured.hasSales;
      }

      if (offersResult.status === "fulfilled") {
        const activePromotions = (offersResult.value.data.items ?? []).filter(
          (offer) => offer.isActive && offer.listings.length > 0,
        );

        nextData.discountedItems = buildDiscountedCarousel(activePromotions).items;
      }

      nextData.allRequestsFailed =
        catalogResult.status === "rejected" && offersResult.status === "rejected";

      setData(nextData);
      setLoading(false);
    };

    void loadShowcase();

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  const openGame = (gameId: number) => {
    void navigate(`/loja/${gameId}`);
  };

  const hasContent =
    data.discountedItems.length > 0 || data.featuredItems.length > 0;

  return (
    <section
      className="nexus-motion bg-slate-950 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-label="Destaques da loja"
    >
      <div className="mx-auto max-w-7xl">
        {loading && <ShowcaseSkeleton />}

        {!loading && data.allRequestsFailed && (
          <div
            className="rounded-2xl border border-slate-800 bg-slate-950 px-6 py-8"
            role="alert"
          >
            <h2 className="text-2xl font-black text-white">
              Os destaques não carregaram
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Não foi possível consultar o catálogo agora. Tente novamente para ver
              jogos e ofertas disponíveis.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((current) => current + 1)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Tentar novamente
            </button>
          </div>
        )}

        {!loading &&
          !data.allRequestsFailed &&
          (data.catalogFailed || data.offersFailed) && (
            <div
              className="mb-8 rounded-2xl border border-amber-500/35 bg-amber-950/55 px-5 py-4 text-sm text-amber-100"
              role="status"
            >
              <p>
                {data.catalogFailed
                  ? "Os jogos em destaque não carregaram agora."
                  : "As ofertas em destaque não carregaram agora."}
              </p>
              <button
                type="button"
                onClick={() => setAttempt((current) => current + 1)}
                className="mt-2 min-h-11 rounded-xl px-1 py-2 font-bold text-amber-50 underline decoration-amber-300/70 underline-offset-4 hover:text-white"
              >
                Tentar novamente
              </button>
            </div>
          )}

        {!loading &&
          !data.allRequestsFailed &&
          !data.catalogFailed &&
          !data.offersFailed &&
          !hasContent && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-6 py-8">
              <h2 className="text-2xl font-black text-white">
                Novidades a caminho
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Ainda não há jogos ou ofertas disponíveis para destacar.
              </p>
            </div>
          )}

        {!loading && hasContent && (
          <div className="space-y-14 sm:space-y-16">
            {data.discountedItems.length > 0 && (
              <TopDiscountsCarousel
                items={data.discountedItems}
                onOpen={openGame}
                title="Ofertas em destaque"
                description="Descontos ativos para comparar antes de escolher sua plataforma."
                viewAllTo="/ofertas"
                viewAllLabel="Ver todas"
                carouselId="home-ofertas-em-destaque"
              />
            )}

            {data.featuredItems.length > 0 && (
              <TopGamesCarousel
                items={data.featuredItems}
                hasSales={data.hasSales}
                onOpen={openGame}
                title={data.hasSales ? "Mais procurados" : "Jogos em destaque"}
                description="Capas, plataformas e preços para descobrir seu próximo jogo."
                viewAllTo="/loja"
                carouselId="home-jogos-em-destaque"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
