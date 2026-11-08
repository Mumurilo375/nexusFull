import { Transaction } from "sequelize";
import sequelize from "../config/database";
import { invalidateCatalogCache } from "../config/cache";
import GamePlatformListing from "../models/GamePlatformListing";
import Games from "../models/Games";
import Platform from "../models/Platform";
import { AppError, requireFound } from "../utils/app-error";
import { toNumber } from "../utils/money";
import { countListingStockSummary } from "../utils/stock";
import {
  AddGamePlatformKeysInput,
  UpdateGamePlatformInput,
} from "../validators/game-platform-admin.validator";
import { bulkCreateGameKeys } from "./game-key.service";
import { createListingPriceChange } from "./listing-price-change.service";

const EMPTY_STOCK = { available: 0, reserved: 0, sold: 0, total: 0 };

function buildGamePlatformState(
  platform: Platform,
  listing: GamePlatformListing | null,
  stock = EMPTY_STOCK,
) {
  return {
    platform: {
      id: platform.id,
      name: platform.name,
      slug: platform.slug,
      iconUrl: platform.iconUrl,
      isActive: platform.isActive,
    },
    hasListing: Boolean(listing),
    listingId: listing?.id ?? null,
    price: listing ? toNumber(listing.price) : null,
    isActive: listing?.isActive ?? false,
    stock,
  };
}

async function findGameOrFail(id: number, transaction?: Transaction) {
  return requireFound(
    await Games.findByPk(id, { transaction }),
    "GAME_NOT_FOUND",
    "Game not found",
  );
}

async function findPlatformOrFail(id: number, transaction?: Transaction) {
  return requireFound(
    await Platform.findByPk(id, { transaction }),
    "PLATFORM_NOT_FOUND",
    "Platform not found",
  );
}

async function findListingByGameAndPlatform(
  gameId: number,
  platformId: number,
  transaction?: Transaction,
) {
  return GamePlatformListing.findOne({
    where: { gameId, platformId },
    transaction,
  });
}

async function getGamePlatformState(gameId: number, platformId: number) {
  const [platform, listing] = await Promise.all([
    findPlatformOrFail(platformId),
    findListingByGameAndPlatform(gameId, platformId),
  ]);
  const stock = listing ? await countListingStockSummary(listing.id) : EMPTY_STOCK;

  return buildGamePlatformState(platform, listing, stock);
}

export async function getGamePlatformsById(gameId: number) {
  const [game, platforms, listings] = await Promise.all([
    Games.findByPk(gameId, { attributes: ["id", "title", "coverImageUrl"] }),
    Platform.findAll({ order: [["name", "ASC"]] }),
    GamePlatformListing.findAll({
      where: { gameId },
      order: [["id", "ASC"]],
    }),
  ]);

  const foundGame = requireFound(game, "GAME_NOT_FOUND", "Game not found");
  const listingByPlatformId = new Map(
    listings.map((listing) => [listing.platformId, listing] as const),
  );
  const stockByPlatformId = new Map(
    await Promise.all(
      listings.map(async (listing) =>
        [listing.platformId, await countListingStockSummary(listing.id)] as const,
      ),
    ),
  );

  return {
    game: foundGame.toJSON(),
    platforms: platforms.map((platform) =>
      buildGamePlatformState(
        platform,
        listingByPlatformId.get(platform.id) ?? null,
        stockByPlatformId.get(platform.id) ?? EMPTY_STOCK,
      ),
    ),
  };
}

export async function updateGamePlatform(
  gameId: number,
  platformId: number,
  input: UpdateGamePlatformInput,
  changedByUserId?: number,
) {
  await sequelize.transaction(async (transaction) => {
    await Promise.all([
      findGameOrFail(gameId, transaction),
      findPlatformOrFail(platformId, transaction),
    ]);

    const listing = await findListingByGameAndPlatform(gameId, platformId, transaction);
    if (!listing) {
      if (input.price === undefined) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "price is required when configuring a new platform",
        );
      }

      const createdListing = await GamePlatformListing.create(
        {
          gameId,
          platformId,
          price: input.price,
          isActive: input.isActive ?? true,
        },
        { transaction },
      );

      await createListingPriceChange({
        listingId: createdListing.id,
        previousPrice: null,
        nextPrice: toNumber(input.price),
        changedByUserId,
        transaction,
      });
      return;
    }

    const previousPrice = toNumber(listing.price);
    const nextPrice = input.price === undefined ? previousPrice : toNumber(input.price);

    await listing.update(
      {
        price: nextPrice,
        isActive: input.isActive ?? listing.isActive,
      },
      { transaction },
    );

    if (input.price !== undefined && nextPrice !== previousPrice) {
      await createListingPriceChange({
        listingId: listing.id,
        previousPrice,
        nextPrice,
        changedByUserId,
        transaction,
      });
    }
  });

  await invalidateCatalogCache();
  return getGamePlatformState(gameId, platformId);
}

export async function addKeysToGamePlatform(
  gameId: number,
  platformId: number,
  input: AddGamePlatformKeysInput,
) {
  await Promise.all([findGameOrFail(gameId), findPlatformOrFail(platformId)]);

  const listing = await findListingByGameAndPlatform(gameId, platformId);
  if (!listing) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Configure the platform before adding keys",
    );
  }

  return {
    listingId: listing.id,
    ...(await bulkCreateGameKeys({
      listingId: listing.id,
      keyValues: input.keyValues,
    })),
  };
}
