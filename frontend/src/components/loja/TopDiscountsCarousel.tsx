import GameCarousel from "./GameCarousel";
import { toMoney } from "./store.utils";

export type TopDiscountsCarouselItem = {
  id: number;
  title: string;
  coverImageUrl?: string;
  discountPercentage: number;
  finalPrice: number;
  platforms?: string[];
};

type TopDiscountsCarouselProps = {
  items: TopDiscountsCarouselItem[];
  onOpen: (gameId: number) => void;
  title?: string;
  description?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  carouselId?: string;
};

export default function TopDiscountsCarousel({
  items,
  onOpen,
  title = "Em oferta",
  description = "Maiores descontos ativos no catálogo.",
  viewAllTo,
  viewAllLabel,
  carouselId = "carrossel-ofertas",
}: TopDiscountsCarouselProps) {
  return (
    <GameCarousel
      carouselId={carouselId}
      title={title}
      description={description}
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        coverImageUrl: item.coverImageUrl,
        priceLabel: toMoney(item.finalPrice),
        badgeLabel: `-${item.discountPercentage}%`,
        platforms: item.platforms,
      }))}
      accent="emerald"
      onOpen={onOpen}
      viewAllTo={viewAllTo}
      viewAllLabel={viewAllLabel}
    />
  );
}
