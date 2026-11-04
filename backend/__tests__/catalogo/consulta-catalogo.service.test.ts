import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import Games from "../../src/models/Games";
import GamePlatformListing from "../../src/models/GamePlatformListing";
import Promotion from "../../src/models/Promotion";
import PromotionListing from "../../src/models/PromotionListing";
import Review from "../../src/models/Review";
import { getGameById, getGameDetailsById, listGames } from "../../src/services/game.service";
import { getListingById, getListingDetailsById, getListingStockById } from "../../src/services/listing.service";
import { getPromotionById, listPromotions } from "../../src/services/promotion.service";
import { countListingStockSummary } from "../../src/utils/stock";

jest.mock("../../src/config/database", () => {
  const { Sequelize } = jest.requireActual<typeof import("sequelize")>("sequelize");
  return { __esModule: true, default: new Sequelize({ dialect: "postgres", logging: false }) };
});

jest.mock("../../src/utils/stock", () => ({ countListingStockSummary: jest.fn() }));

const estoque = { available: 3, reserved: 1, sold: 2, total: 6 };
const oferta = { id: 10, price: 100, isActive: true };

function criarJogo() {
  const jogo = Games.build({ id: 7, title: "Jogo de teste" });
  jogo.setDataValue("categories", [{ id: 2, name: "RPG" }, { id: 1, name: "Ação" }]);
  jogo.setDataValue("images", [{ id: 2, sortOrder: 1 }, { id: 1, sortOrder: 0 }]);
  jogo.setDataValue("platformListings", [oferta, { id: 11, price: 50, isActive: true }]);
  return jogo;
}

describe("consulta do catálogo", () => {
  beforeEach(() => {
    jest.mocked(countListingStockSummary).mockResolvedValue(estoque);
    const vinculo = PromotionListing.build({ listingId: 10, promotionId: 1 });
    vinculo.setDataValue("promotion", Promotion.build({ id: 1, name: "Oferta", discountPercentage: 25 }));
    jest.spyOn(PromotionListing, "findAll").mockResolvedValue([vinculo]);
    jest.spyOn(Review, "count").mockResolvedValue(4);
    jest.spyOn(Review, "findOne").mockResolvedValue({ averageRating: "4.25" } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("mantém paginação, ordenação, estoque e descontos na lista de jogos", async () => {
    const buscar = jest.spyOn(Games, "findAndCountAll").mockResolvedValue({
      rows: [criarJogo()], count: 22,
    } as never);

    const resultado = await listGames({ page: 2, limit: 10, q: "teste" });

    expect(resultado.meta).toEqual({ page: 2, limit: 10, total: 22, totalPages: 3 });
    expect(resultado.items[0]).toMatchObject({
      id: 7,
      categories: [{ id: 1 }, { id: 2 }],
      images: [{ id: 1 }, { id: 2 }],
      platformListings: [
        { id: 11, stock: estoque, pricing: { finalPrice: 37.5, discountPercentage: 25 } },
        { id: 10, stock: estoque, pricing: { finalPrice: 75, discountPercentage: 25 } },
      ],
    });
    expect(buscar).toHaveBeenCalledWith(expect.objectContaining({ limit: 10, offset: 10 }));
  });

  it("retorna jogos sem ofertas e uma página vazia", async () => {
    const buscar = jest.spyOn(Games, "findAndCountAll");
    buscar.mockResolvedValueOnce({ rows: [Games.build({ id: 7 })], count: 1 } as never);
    const resultado = await listGames({ page: 1, limit: 10 });
    expect(resultado.items[0].platformListings).toEqual([]);
    expect(countListingStockSummary).not.toHaveBeenCalled();

    buscar.mockResolvedValueOnce({ rows: [], count: 0 } as never);
    await expect(listGames({ page: 1, limit: 10 })).resolves.toEqual({
      items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it("mantém estatísticas de avaliações e promoções nos detalhes do jogo", async () => {
    jest.spyOn(Games, "findByPk").mockResolvedValue(criarJogo());
    const resultado = await getGameDetailsById(7);
    expect(resultado).toMatchObject({
      id: 7,
      reviewStats: { totalReviews: 4, averageRating: 4.3 },
      platformListings: [
        { id: 11, stock: estoque, activePromotions: [{ id: 1 }], pricing: { finalPrice: 37.5 } },
        { id: 10, stock: estoque, activePromotions: [{ id: 1 }], pricing: { finalPrice: 75 } },
      ],
    });
  });

  it("preserva a consulta simples do jogo sem carregar estoque", async () => {
    jest.spyOn(Games, "findByPk").mockResolvedValue(criarJogo());
    const resultado = await getGameById(7);
    expect(resultado.platformListings).toEqual([{ id: 11, price: 50, isActive: true }, oferta]);
    expect(countListingStockSummary).not.toHaveBeenCalled();
  });

  it("rejeita jogo inexistente na consulta simples e nos detalhes", async () => {
    jest.spyOn(Games, "findByPk").mockResolvedValue(null);
    for (const consultar of [getGameById, getGameDetailsById]) {
      await expect(consultar(999)).rejects.toMatchObject({ statusCode: 404, code: "GAME_NOT_FOUND" });
    }
  });

  it("retorna a oferta e o seu estoque", async () => {
    const listing = GamePlatformListing.build({ ...oferta, gameId: 7, platformId: 1 });
    jest.spyOn(GamePlatformListing, "findByPk").mockResolvedValue(listing);
    await expect(getListingById(10)).resolves.toBe(listing);
    await expect(getListingStockById(10)).resolves.toEqual({ listingId: 10, stock: estoque });
  });

  it("mantém ordenação, avaliações, estoque e desconto nos detalhes da oferta", async () => {
    const listing = GamePlatformListing.build({ ...oferta, gameId: 7, platformId: 1 });
    listing.setDataValue("game", criarJogo().toJSON());
    jest.spyOn(GamePlatformListing, "findByPk").mockResolvedValue(listing);
    await expect(getListingDetailsById(10)).resolves.toMatchObject({
      id: 10,
      game: { images: [{ id: 1 }, { id: 2 }], platformListings: [{ id: 11 }, { id: 10 }] },
      stock: estoque,
      reviewStats: { totalReviews: 4, averageRating: 4.3 },
      pricing: { basePrice: 100, discountPercentage: 25, finalPrice: 75 },
    });
  });

  it("rejeita oferta inexistente antes de consultar seu estoque ou avaliações", async () => {
    jest.spyOn(GamePlatformListing, "findByPk").mockResolvedValue(null);
    for (const consultar of [getListingById, getListingDetailsById, getListingStockById]) {
      await expect(consultar(999)).rejects.toMatchObject({ statusCode: 404, code: "LISTING_NOT_FOUND" });
    }
    expect(countListingStockSummary).not.toHaveBeenCalled();
    expect(Review.count).not.toHaveBeenCalled();
  });

  it("propaga falha ao carregar estoque de um jogo", async () => {
    jest.spyOn(Games, "findByPk").mockResolvedValue(criarJogo());
    jest.mocked(countListingStockSummary).mockRejectedValueOnce(new Error("Estoque indisponível"));
    await expect(getGameDetailsById(7)).rejects.toThrow("Estoque indisponível");
    expect(Review.count).not.toHaveBeenCalled();
  });

  it("mantém paginação e preços das promoções, ignorando vínculos sem oferta", async () => {
    const promocao = Promotion.build({ id: 1, name: "Oferta", discountPercentage: 25 });
    promocao.setDataValue("promotionListings", [{ listing: null }, { listing: oferta }]);
    jest.spyOn(Promotion, "findAll").mockResolvedValue([promocao, promocao]);

    const resultado = await listPromotions({ page: 2, limit: 1 });

    expect(resultado.meta).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
    expect(resultado.items).toHaveLength(1);
    expect(resultado.items[0]).toMatchObject({
      id: 1,
      listingIds: [10],
      listings: [{ id: 10, stock: estoque, pricing: { finalPrice: 75, discountPercentage: 25 } }],
    });
  });

  it("retorna promoção sem ofertas vinculadas", async () => {
    jest.spyOn(Promotion, "findByPk").mockResolvedValue(Promotion.build({ id: 1, name: "Oferta" }));
    await expect(getPromotionById(1)).resolves.toMatchObject({ id: 1, listingIds: [], listings: [] });
    expect(countListingStockSummary).not.toHaveBeenCalled();
  });
});
