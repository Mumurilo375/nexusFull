import { FindOptions, Op, Transaction } from "sequelize";
import sequelize from "../config/database";
import { invalidateCatalogCache, rememberCatalog } from "../config/cache";
import Categories from "../models/Category";
import GameCategory from "../models/GameCategory";
import GameImages from "../models/Game_images";
import Games from "../models/Games";
import { AppError, requireFound } from "../utils/app-error";
import { deleteManagedMediaList, isManagedMediaUrl } from "../utils/media-storage";
import { buildPaginationMeta, getPaginationOffset } from "../utils/pagination";
import {
  CreateGameInput,
  ListGamesQuery,
  UpdateGameInput,
} from "../validators/game.validator";
import {
  buildGameInclude,
  enrichPlatformListing,
  loadReviewStats,
  serializeGame,
} from "./catalog.shared";
import {
  buildGalleryItems,
  buildGalleryRows,
  buildGameUpdateFields,
  getManagedGameMediaUrls,
  replaceGameImages,
  saveCoverImage,
  saveGameImages,
  UploadedGameMedia,
} from "./game-media.shared";
import { deleteGameDependencies } from "./game-delete.shared";

export { addKeysToGamePlatform, getGamePlatformsById, updateGamePlatform } from "./game-platform.service";

async function findGameOrFail(id: number, options: FindOptions = {}) {
  return requireFound(await Games.findByPk(id, options), "GAME_NOT_FOUND", "Game not found");
}

async function validateCategoryIds(categoryIds: number[], transaction: Transaction) {
  const uniqueCategoryIds = [...new Set(categoryIds)];
  const categories = await Categories.findAll({
    where: { id: { [Op.in]: uniqueCategoryIds } },
    attributes: ["id"],
    transaction,
  });

  if (categories.length !== uniqueCategoryIds.length) {
    throw new AppError(400, "VALIDATION_ERROR", "One or more categories are invalid");
  }

  return uniqueCategoryIds;
}

async function replaceGameCategories(gameId: number, categoryIds: number[], transaction: Transaction) {
  await GameCategory.destroy({ where: { gameId }, transaction });
  await GameCategory.bulkCreate(
    categoryIds.map((categoryId) => ({ gameId, categoryId })),
    { transaction },
  );
}

function getRemovedGalleryMediaUrls(
  existingImages: GameImages[],
  keptImageIds: Set<number>,
) {
  return existingImages
    .filter(
      (image) => !keptImageIds.has(image.id) && isManagedMediaUrl(image.imageUrl),
    )
    .map((image) => image.imageUrl);
}

function getReplacedCoverMediaUrls(currentCoverImageUrl: string, nextCoverImageUrl: string) {
  return currentCoverImageUrl &&
    currentCoverImageUrl !== nextCoverImageUrl &&
    isManagedMediaUrl(currentCoverImageUrl)
    ? [currentCoverImageUrl]
    : [];
}

async function createGameInTransaction(
  input: CreateGameInput,
  uploadedGameMedia: UploadedGameMedia,
  createdMediaUrls: string[],
  transaction: Transaction,
) {
  const categoryIds = await validateCategoryIds(input.categoryIds, transaction);
  const game = await Games.create(
    {
      title: input.title,
      description: input.description,
      longDescription: input.longDescription,
      releaseDate: input.releaseDate,
      coverImageUrl: input.coverImageUrl || "__pending_cover__",
      isActive: input.isActive,
    },
    { transaction },
  );
  const coverImageUrl = await saveCoverImage({
    gameId: game.id,
    currentUrl: "",
    nextUrl: input.coverImageUrl,
    coverFile: uploadedGameMedia.coverFile,
    createdMediaUrls,
  });

  if (!coverImageUrl) {
    throw new AppError(400, "VALIDATION_ERROR", "cover image is required");
  }

  await Promise.all([
    game.update({ coverImageUrl }, { transaction }),
    replaceGameCategories(game.id, categoryIds, transaction),
  ]);

  const galleryItems = buildGalleryItems(
    input.galleryItems,
    uploadedGameMedia.galleryFiles ?? [],
  );

  if (galleryItems?.length) {
    const { rows } = await buildGalleryRows({
      gameId: game.id,
      galleryItems,
      galleryFiles: uploadedGameMedia.galleryFiles ?? [],
      existingImages: [],
      createdMediaUrls,
    });

    await saveGameImages(game.id, rows, transaction);
  }

  return game.id;
}

async function updateGameInTransaction(
  id: number,
  input: UpdateGameInput,
  uploadedGameMedia: UploadedGameMedia,
  createdMediaUrls: string[],
  transaction: Transaction,
) {
  const game = await findGameOrFail(id, { transaction });
  const existingImages = await GameImages.findAll({
    where: { gameId: id },
    order: [["sortOrder", "ASC"], ["id", "ASC"]],
    transaction,
  });
  const currentCoverImageUrl = String(game.coverImageUrl ?? "").trim();

  if (input.categoryIds) {
    await replaceGameCategories(
      id,
      await validateCategoryIds(input.categoryIds, transaction),
      transaction,
    );
  }

  const coverImageUrl = await saveCoverImage({
    gameId: id,
    currentUrl: currentCoverImageUrl,
    nextUrl: input.coverImageUrl,
    coverFile: uploadedGameMedia.coverFile,
    createdMediaUrls,
  });

  if (!coverImageUrl) {
    throw new AppError(400, "VALIDATION_ERROR", "cover image is required");
  }

  const mediaUrlsToDelete = getReplacedCoverMediaUrls(currentCoverImageUrl, coverImageUrl);
  const galleryItems = buildGalleryItems(
    input.galleryItems,
    uploadedGameMedia.galleryFiles ?? [],
  );

  if (galleryItems !== undefined) {
    const { rows, keptImageIds } = await buildGalleryRows({
      gameId: id,
      galleryItems,
      galleryFiles: uploadedGameMedia.galleryFiles ?? [],
      existingImages,
      createdMediaUrls,
    });

    mediaUrlsToDelete.push(...getRemovedGalleryMediaUrls(existingImages, keptImageIds));
    await replaceGameImages(id, rows, transaction);
  }

  await game.update(buildGameUpdateFields(input, coverImageUrl), { transaction });

  return mediaUrlsToDelete;
}

async function serializeGameWithListings(game: Games) {
  const serializedGame = serializeGame(game);
  return {
    ...serializedGame,
    platformListings: await Promise.all(serializedGame.platformListings.map(enrichPlatformListing)),
  };
}

export async function listGames(query: ListGamesQuery) {
  return rememberCatalog(`games:list:${JSON.stringify(query)}`, async () => {
    const result = await Games.findAndCountAll({
      distinct: true,
      where: query.q
        ? {
            title: {
              [Op.iLike]: `%${query.q}%`,
            },
          }
        : undefined,
      limit: query.limit,
      offset: getPaginationOffset(query.page, query.limit),
      order: [["createdAt", "DESC"]],
      include: buildGameInclude(true),
    });

    return {
      items: await Promise.all(result.rows.map(serializeGameWithListings)),
      meta: buildPaginationMeta(query, result.count),
    };
  });
}

export async function getGameById(id: number) {
  return serializeGame(await findGameOrFail(id, { include: buildGameInclude() }));
}

export async function getGameDetailsById(id: number) {
  const game = await findGameOrFail(id, { include: buildGameInclude(true) });
  const serializedGame = await serializeGameWithListings(game);

  return {
    ...serializedGame,
    reviewStats: await loadReviewStats(id),
  };
}

export async function createGame(
  input: CreateGameInput,
  uploadedGameMedia: UploadedGameMedia = {},
) {
  const createdMediaUrls: string[] = [];

  try {
    const gameId = await sequelize.transaction((transaction) =>
      createGameInTransaction(input, uploadedGameMedia, createdMediaUrls, transaction),
    );

    await invalidateCatalogCache();
    return getGameById(gameId);
  } catch (error) {
    await deleteManagedMediaList(createdMediaUrls);
    throw error;
  }
}

export async function updateGame(
  id: number,
  input: UpdateGameInput,
  uploadedGameMedia: UploadedGameMedia = {},
) {
  const createdMediaUrls: string[] = [];

  try {
    const mediaUrlsToDelete = await sequelize.transaction((transaction) =>
      updateGameInTransaction(id, input, uploadedGameMedia, createdMediaUrls, transaction),
    );

    await invalidateCatalogCache();
    await deleteManagedMediaList(mediaUrlsToDelete);
    return getGameById(id);
  } catch (error) {
    await deleteManagedMediaList(createdMediaUrls);
    throw error;
  }
}

export async function deleteGame(id: number) {
  const mediaUrls = await sequelize.transaction(async (transaction) => {
    const game = await findGameOrFail(id, { transaction });
    const images = await deleteGameDependencies(id, transaction);
    await game.destroy({ transaction });

    return getManagedGameMediaUrls(game, images);
  });

  await invalidateCatalogCache();
  await deleteManagedMediaList(mediaUrls);
}
