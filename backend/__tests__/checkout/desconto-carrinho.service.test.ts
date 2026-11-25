import { afterEach, describe, expect, it, jest } from "@jest/globals";
import CartItem from "../../src/models/CartItem";
import GamePlatformListing from "../../src/models/GamePlatformListing";
import Promotion from "../../src/models/Promotion";
import PromotionListing from "../../src/models/PromotionListing";
import { listUserCart } from "../../src/services/cart.service";
import { countListingStockSummary } from "../../src/utils/stock";

jest.mock("../../src/config/database", () => {
  const { Sequelize } = jest.requireActual<typeof import("sequelize")>("sequelize");
  return { __esModule: true, default: new Sequelize({ dialect: "postgres", logging: false }) };
});
jest.mock("../../src/utils/stock", () => ({ countListingStockSummary: jest.fn() }));

describe("preços promocionais no carrinho", () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it("aplica a maior oferta ativa por listing e calcula o subtotal com as quantidades", async () => {
    const items = [
      { id: 1, listingId: 10, quantity: 2, price: 0.04 },
      { id: 2, listingId: 11, quantity: 1, price: 0.04 },
    ].map(({ price, ...data }) => {
      const item = CartItem.build(data);
      Object.assign(item, { listing: GamePlatformListing.build({ id: data.listingId, price }) });
      return item;
    });
    jest.spyOn(CartItem, "findAll").mockResolvedValue(items);
    jest.mocked(countListingStockSummary).mockResolvedValue({ available: 3, reserved: 0, sold: 0, total: 3 });
    const link = (percentage: number) => {
      const promotionLink = PromotionListing.build();
      promotionLink.setDataValue("promotion", Promotion.build({ discountPercentage: percentage }));
      return promotionLink;
    };
    jest.spyOn(PromotionListing, "findAll").mockImplementation(async (options) =>
      (options?.where as { listingId: number }).listingId === 10 ? [link(25), link(50)] : [],
    );

    const result = await listUserCart(1);

    expect(result.items[0].listing?.pricing).toMatchObject({ basePrice: 0.04, discountPercentage: 50, finalPrice: 0.02 });
    expect(result.items[1].listing?.pricing).toMatchObject({ basePrice: 0.04, discountPercentage: 0, finalPrice: 0.04 });
    expect(result.meta).toMatchObject({ totalItems: 3, subtotal: 0.08 });
  });
});
