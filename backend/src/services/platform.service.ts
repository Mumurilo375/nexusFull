import { FindOptions, Op } from "sequelize";
import Platform from "../models/Platform";
import { invalidateCatalogCache } from "../config/cache";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import { AppError, requireFound } from "../utils/app-error";
import { buildPage, getPaginationOffset } from "../utils/pagination";
import {
  deleteManagedMedia,
  deleteManagedMediaList,
  isManagedMediaUrl,
  moveUploadedPlatformIcon,
} from "../utils/media-storage";
import { CreatePlatformInput, ListPlatformsQuery, UpdatePlatformInput } from "../validators/platform.validator";

async function findPlatformOrFail(id: number, options: FindOptions = {}): Promise<Platform> {
  return requireFound(
    await Platform.findByPk(id, options),
    "PLATFORM_NOT_FOUND",
    "Platform not found",
  );
}

async function checkDuplicate(input: { name?: string; slug?: string }, excludeId?: number): Promise<void> {
  const conditions = [];
  if (input.name) conditions.push({ name: input.name });
  if (input.slug) conditions.push({ slug: input.slug });
  if (conditions.length === 0) return;

  const where = {
    [Op.or]: conditions,
    ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
  };

  const existing = await Platform.findOne({ where });

  if (!existing) return;

  if (input.name && existing.name === input.name) {
    throw new AppError(409, "PLATFORM_ALREADY_EXISTS", "Platform name is already in use");
  }
  throw new AppError(409, "PLATFORM_ALREADY_EXISTS", "Platform slug is already in use");
}

export async function listPlatforms(query: ListPlatformsQuery) {
  const result = await Platform.findAndCountAll({
    limit: query.limit,
    offset: getPaginationOffset(query.page, query.limit),
    order: [["name", "ASC"]],
  });

  return buildPage(query, result);
}

export async function getPlatformById(id: number) {
  return findPlatformOrFail(id, {
    include: [{
      model: GamePlatformListing,
      as: "gameListings",
      include: [{ model: Games, as: "game" }],
    }],
  });
}

export async function createPlatform(
  input: CreatePlatformInput,
  iconFile?: Express.Multer.File | null,
) {
  const createdMediaUrls: string[] = [];

  await checkDuplicate(input);

  try {
    const platform = await Platform.create({ ...input });

    if (iconFile) {
      const iconUrl = await moveUploadedPlatformIcon(iconFile, platform.id);
      createdMediaUrls.push(iconUrl);
      await platform.update({ iconUrl });
    }

    await invalidateCatalogCache();
    return platform;
  } catch (error) {
    await deleteManagedMediaList(createdMediaUrls);
    throw error;
  }
}

export async function updatePlatform(
  id: number,
  input: UpdatePlatformInput,
  iconFile?: Express.Multer.File | null,
) {
  const createdMediaUrls: string[] = [];
  const platform = await findPlatformOrFail(id);
  const currentIconUrl = platform.iconUrl;

  await checkDuplicate(input, id);

  try {
    const nextInput = { ...input };

    if (iconFile) {
      const iconUrl = await moveUploadedPlatformIcon(iconFile, platform.id);
      createdMediaUrls.push(iconUrl);
      nextInput.iconUrl = iconUrl;
    }

    await platform.update(nextInput);
    await invalidateCatalogCache();

    if (
      currentIconUrl &&
      currentIconUrl !== platform.iconUrl &&
      isManagedMediaUrl(currentIconUrl)
    ) {
      await deleteManagedMedia(currentIconUrl);
    }
  } catch (error) {
    await deleteManagedMediaList(createdMediaUrls);
    throw error;
  }

  return platform;
}

export async function deletePlatform(id: number) {
  const platform = await findPlatformOrFail(id);
  const iconUrl = platform.iconUrl;

  await platform.destroy();
  await invalidateCatalogCache();

  if (isManagedMediaUrl(iconUrl)) {
    await deleteManagedMedia(iconUrl);
  }
}
