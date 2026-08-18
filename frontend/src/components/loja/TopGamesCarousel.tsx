import GameCarousel from "./GameCarousel";
import { toMoney } from "./store.utils";

export type TopGamesCarouselItem = {
  id: number;
  title: string;
  coverImageUrl?: string;
  soldCount: number;
  lowestPrice: number | null;
  categories: string[];
  platforms?: string[];
};

type TopGamesCarouselProps = {
  items: TopGamesCarouselItem[];
  hasSales: boolean;
  onOpen: (gameId: number) => void;
  title?: string;
  description?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  carouselId?: string;
};

function formatPriceLabel(price: number | null) {
  return price !== null ? `A partir de ${toMoney(price)}` : "Preço indisponível";
}

export default function TopGamesCarousel({
  items,
  hasSales,
  onOpen,
  title = hasSales ? "Mais vendidos" : "Jogos em destaque",
  description = "Uma seleção rápida para continuar explorando.",
  viewAllTo,
  viewAllLabel,
  carouselId = "carrossel-mais-vendidos",
}: TopGamesCarouselProps) {
  return (
    <GameCarousel
      carouselId={carouselId}
      title={title}
      description={description}
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        coverImageUrl: item.coverImageUrl,
        priceLabel: formatPriceLabel(item.lowestPrice),
        detailLabel: item.categories.slice(0, 2).join(" • ") || undefined,
        platforms: item.platforms,
      }))}
      accent="cyan"
      onOpen={onOpen}
      viewAllTo={viewAllTo}
      viewAllLabel={viewAllLabel}
    />
  );
}
