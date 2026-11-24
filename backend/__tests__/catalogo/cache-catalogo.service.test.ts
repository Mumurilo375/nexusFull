import { afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import Games from "../../src/models/Games";
import Promotion from "../../src/models/Promotion";
import Review from "../../src/models/Review";

jest.mock("../../src/config/database", () => {
  const { Sequelize } = jest.requireActual<typeof import("sequelize")>("sequelize");
  return { __esModule: true, default: new Sequelize({ dialect: "postgres", logging: false }) };
});

// Simula as operações de Redis usadas pelo cache, inclusive a expiração das chaves.
const valores = new Map<string, { valor: string; expiraEm?: number }>();
const redis = {
  isReady: true,
  on: jest.fn(),
  get: jest.fn(async (chave: string) => {
    const item = valores.get(chave);
    if (!item || (item.expiraEm !== undefined && item.expiraEm <= Date.now())) return null;
    return item.valor;
  }),
  set: jest.fn(async (chave: string, valor: string, options: { EX: number }) => {
    valores.set(chave, { valor, expiraEm: Date.now() + options.EX * 1000 });
  }),
  incr: jest.fn(async (chave: string) => {
    const versao = Number(valores.get(chave)?.valor ?? 0) + 1;
    valores.set(chave, { valor: String(versao) });
    return versao;
  }),
};

jest.mock("redis", () => ({ createClient: () => redis }));

const redisUrlAnterior = process.env.REDIS_URL;
const ttlAnterior = process.env.CACHE_TTL_SECONDS;
process.env.REDIS_URL = "redis://cache-de-teste";
process.env.CACHE_TTL_SECONDS = "300";

const { getGameDetailsById } = require("../../src/services/game.service") as typeof import("../../src/services/game.service");
const { listPromotions, getPromotionById } = require("../../src/services/promotion.service") as typeof import("../../src/services/promotion.service");
const { createReview, updateReview, deleteReview } = require("../../src/services/review.service") as typeof import("../../src/services/review.service");
const { invalidateCatalogCache } = require("../../src/config/cache") as typeof import("../../src/config/cache");

describe("cache das ofertas e dos detalhes dos jogos", () => {
  beforeEach(() => {
    valores.clear();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (redisUrlAnterior === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = redisUrlAnterior;
    if (ttlAnterior === undefined) delete process.env.CACHE_TTL_SECONDS;
    else process.env.CACHE_TTL_SECONDS = ttlAnterior;
  });

  it("reutiliza detalhes do jogo e busca novamente após a invalidação", async () => {
    const buscar = jest.spyOn(Games, "findByPk").mockResolvedValue(Games.build({ id: 7, title: "Jogo" }));
    jest.spyOn(Review, "count").mockResolvedValue(0);
    jest.spyOn(Review, "findOne").mockResolvedValue(null);

    const primeiro = await getGameDetailsById(7);
    expect(await getGameDetailsById(7)).toEqual(JSON.parse(JSON.stringify(primeiro)));
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalledWith(expect.any(String), expect.any(String), { EX: 60 });

    await invalidateCatalogCache();
    await getGameDetailsById(7);
    expect(buscar).toHaveBeenCalledTimes(2);
  });

  it("separa filtros e páginas das ofertas e expira após 60 segundos", async () => {
    const agora = jest.spyOn(Date, "now").mockReturnValue(1_000_000);
    const buscar = jest.spyOn(Promotion, "findAll").mockResolvedValue([]);

    await listPromotions({ page: 1, limit: 10, activeNow: true });
    await listPromotions({ page: 1, limit: 10, activeNow: true });
    await listPromotions({ page: 2, limit: 10, activeNow: true });
    await listPromotions({ page: 1, limit: 10, activeNow: false });
    expect(buscar).toHaveBeenCalledTimes(3);

    agora.mockReturnValue(1_060_000);
    await listPromotions({ page: 1, limit: 10, activeNow: true });
    expect(buscar).toHaveBeenCalledTimes(4);
  });

  it("reutiliza detalhes da promoção e não armazena erros de promoção inexistente", async () => {
    const buscar = jest.spyOn(Promotion, "findByPk")
      .mockResolvedValueOnce(Promotion.build({ id: 1, name: "Oferta" }))
      .mockResolvedValue(null);

    expect(await getPromotionById(1)).toMatchObject({ id: 1, name: "Oferta" });
    expect(await getPromotionById(1)).toMatchObject({ id: 1, name: "Oferta" });
    await expect(getPromotionById(2)).rejects.toMatchObject({ statusCode: 404 });
    await expect(getPromotionById(2)).rejects.toMatchObject({ statusCode: 404 });
    expect(buscar).toHaveBeenCalledTimes(3);
  });

  it("consulta o banco quando a leitura do Redis falha", async () => {
    jest.spyOn(redis, "get").mockRejectedValueOnce(new Error("Redis indisponível"));
    const buscar = jest.spyOn(Promotion, "findAll").mockResolvedValue([]);
    const aviso = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(await listPromotions({ page: 1, limit: 10 })).toMatchObject({ items: [] });
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(aviso).toHaveBeenCalled();
  });

  it("invalida detalhes após criar, editar e excluir uma avaliação", async () => {
    const jogo = Games.build({ id: 7, title: "Jogo" });
    const buscarJogo = jest.spyOn(Games, "findByPk").mockResolvedValue(jogo);
    const buscarNota = jest.spyOn(Review, "count").mockResolvedValue(0);
    jest.spyOn(Review, "findOne").mockResolvedValue(null);
    const review = Review.build({ id: 1, gameId: 7, userId: 3, rating: 4 });
    jest.spyOn(Review, "create").mockResolvedValue(review as never);
    jest.spyOn(Review, "findByPk").mockResolvedValue(review);
    jest.spyOn(review, "update").mockResolvedValue(review);
    jest.spyOn(review, "destroy").mockResolvedValue();

    await getGameDetailsById(7);
    await createReview(3, { gameId: 7, rating: 4, comment: "Bom" });
    buscarNota.mockResolvedValue(1);
    expect((await getGameDetailsById(7)).reviewStats.totalReviews).toBe(1);
    await updateReview(3, 1, { rating: 5, comment: "Ótimo" });
    await getGameDetailsById(7);
    await deleteReview(3, 1);
    await getGameDetailsById(7);
    // Uma consulta para cada versão do cache; a criação também verifica a existência do jogo.
    expect(buscarJogo).toHaveBeenCalledTimes(5);
    expect(buscarNota).toHaveBeenCalledTimes(4);
  });
});
