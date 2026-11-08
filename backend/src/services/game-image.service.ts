import GameImages from "../models/Game_images";
import { invalidateCatalogCache } from "../config/cache";
import Games from "../models/Games";
import { requireFound } from "../utils/app-error";
import { buildPage, getPaginationOffset } from "../utils/pagination";
import { CreateGameImageInput, ListGameImagesQuery, UpdateGameImageInput } from "../validators/game-image.validator";

async function findGameImageOrFail(id: number): Promise<GameImages> {
  return requireFound(await GameImages.findByPk(id), "GAME_IMAGE_NOT_FOUND", "Game image not found");
}

export async function listGameImages(query: ListGameImagesQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const where = query.gameId ? { gameId: query.gameId } : undefined;

  const result = await GameImages.findAndCountAll({
    where,
    limit: query.limit,
    offset,
    order: [["sortOrder", "ASC"], ["id", "DESC"]],
    include: [{ model: Games, as: "game" }],
  });

  return buildPage(query, result);
}

export async function getGameImageById(id: number) {
  return requireFound(await GameImages.findByPk(id, {
    include: [{ model: Games, as: "game" }],
  }), "GAME_IMAGE_NOT_FOUND", "Game image not found");
}

export async function createGameImage(input: CreateGameImageInput) {
  requireFound(await Games.findByPk(input.gameId), "GAME_NOT_FOUND", "Game not found");

  const image = await GameImages.create({
    gameId: input.gameId,
    imageUrl: input.imageUrl,
    sortOrder: input.sortOrder ?? 0,
  });
  await invalidateCatalogCache();
  return image;
}

export async function updateGameImage(id: number, input: UpdateGameImageInput) {
  const image = await findGameImageOrFail(id);
  await image.update(input);
  await invalidateCatalogCache();
  return image;
}

export async function deleteGameImage(id: number) {
  const image = await findGameImageOrFail(id);
  await image.destroy();
  await invalidateCatalogCache();
}
