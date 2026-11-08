import GameTag from "../models/GameTag";
import { invalidateCatalogCache } from "../config/cache";
import Games from "../models/Games";
import Tags from "../models/Tags";
import { requireFound } from "../utils/app-error";
import { buildPage, getPaginationOffset } from "../utils/pagination";
import { CreateGameTagInput, ListGameTagsQuery } from "../validators/game-tag.validator";

export async function listGameTags(query: ListGameTagsQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const where = query.gameId ? { gameId: query.gameId } : undefined;

  const result = await GameTag.findAndCountAll({
    where,
    limit: query.limit,
    offset,
    order: [["gameId", "DESC"], ["tagId", "DESC"]],
    include: [
      { model: Games, as: "game" },
      { model: Tags, as: "tag" },
    ],
  });

  return buildPage(query, result);
}

export async function createGameTag(input: CreateGameTagInput) {
  requireFound(await Games.findByPk(input.gameId), "GAME_NOT_FOUND", "Game not found");
  requireFound(await Tags.findByPk(input.tagId), "TAG_NOT_FOUND", "Tag not found");

  const [item] = await GameTag.findOrCreate({
    where: { gameId: input.gameId, tagId: input.tagId },
    defaults: { gameId: input.gameId, tagId: input.tagId },
  });

  await invalidateCatalogCache();
  return item;
}

export async function deleteGameTag(gameId: number, tagId: number) {
  await GameTag.destroy({ where: { gameId, tagId } });
  await invalidateCatalogCache();
}
