import { describe, expect, it } from "vitest";
import {
  buildDiscountedCarousel,
  buildFeaturedCarousel,
} from "../../../components/loja/catalogShowcase";
import type { ListingMap } from "../../../components/loja/store.types";
import type { OfferItem } from "../../../pages/offers.types";

describe("dados das prateleiras da loja", () => {
  it("ordena jogos por vendas e usa o menor preço válido", () => {
    const listings: ListingMap = new Map([
      [
        1,
        [
          {
            id: 11,
            gameId: 1,
            price: 90,
            stock: { sold: 3 },
            platform: { id: 1, name: "Steam" },
          },
          {
            id: 12,
            gameId: 1,
            price: 70,
            stock: { sold: 2 },
            platform: { id: 2, name: "Xbox" },
          },
        ],
      ],
      [
        2,
        [
          {
            id: 21,
            gameId: 2,
            price: 40,
            stock: { sold: 8 },
            platform: { id: 1, name: "Steam" },
          },
        ],
      ],
    ]);

    const result = buildFeaturedCarousel(
      [
        { id: 1, title: "Jogo A", description: "A" },
        { id: 2, title: "Jogo B", description: "B" },
      ],
      listings,
    );

    expect(result.hasSales).toBe(true);
    expect(result.items.map((item) => item.id)).toEqual([2, 1]);
    expect(result.items[1]).toMatchObject({
      lowestPrice: 70,
      soldCount: 5,
      platforms: ["Steam", "Xbox"],
    });
  });

  it("mantém a melhor oferta por jogo e ignora listings inativas", () => {
    const promotions: OfferItem[] = [
      {
        id: 1,
        name: "Oferta menor",
        discountPercentage: 20,
        isActive: true,
        listings: [
          {
            id: 11,
            isActive: true,
            price: 100,
            game: { id: 7, title: "Jogo em oferta", coverImageUrl: "/cover.jpg" },
            platform: { id: 1, name: "Xbox" },
            pricing: { basePrice: 100, finalPrice: 80 },
            stock: { sold: 4 },
          },
        ],
      },
      {
        id: 2,
        name: "Oferta maior",
        discountPercentage: 40,
        isActive: true,
        listings: [
          {
            id: 12,
            isActive: true,
            price: 100,
            game: { id: 7, title: "Jogo em oferta", coverImageUrl: "/cover.jpg" },
            platform: { id: 2, name: "PlayStation" },
            pricing: { basePrice: 100, finalPrice: 60 },
            stock: { sold: 2 },
          },
          {
            id: 13,
            isActive: false,
            price: 50,
            game: { id: 8, title: "Listing inativa" },
            platform: { id: 1, name: "Steam" },
            pricing: { basePrice: 50, finalPrice: 30 },
          },
        ],
      },
    ];

    const result = buildDiscountedCarousel(promotions);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 7,
      discountPercentage: 40,
      finalPrice: 60,
      platforms: ["Xbox", "PlayStation"],
    });
  });
});
