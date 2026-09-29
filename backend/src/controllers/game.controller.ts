import { Request, Response } from "express";
import {
  addKeysToGamePlatform,
  createGame,
  deleteGame,
  getGameById,
  getGameDetailsById,
  getGamePlatformsById,
  listGames,
  updateGame,
  updateGamePlatform,
} from "../services/game.service";
import {
  validateAddGamePlatformKeysInput,
  validatePlatformIdParam,
  validateUpdateGamePlatformInput,
} from "../validators/game-platform-admin.validator";
import {
  validateCreateGameInput,
  validateIdParam,
  validateListGamesQuery,
  validateUpdateGameInput,
} from "../validators/game.validator";
import { UploadedGameMediaFiles } from "../middlewares/image-upload.middleware";
import { withTemporaryUploads } from "../utils/with-temporary-uploads";

function readUploadedGameMediaFiles(files: Request["files"]) {
  const uploadedFiles = (files as UploadedGameMediaFiles | undefined) ?? {};

  return {
    coverFile: uploadedFiles.coverFile?.[0] ?? null,
    galleryFiles: uploadedFiles.galleryFiles ?? [],
  };
}

function listUploadedGameMedia(files: Request["files"]) {
  const uploadedFiles = readUploadedGameMediaFiles(files);
  return [
    uploadedFiles.coverFile,
    ...uploadedFiles.galleryFiles,
  ];
}

class GameController {
  static async list(req: Request, res: Response): Promise<void> {
    const paginationFilters = validateListGamesQuery(req.query);
    const gamesPage = await listGames(paginationFilters);
    res.status(200).json(gamesPage);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const gameId = validateIdParam(req.params.id as string);
    const game = await getGameById(gameId);
    res.status(200).json(game);
  }

  static async details(req: Request, res: Response): Promise<void> {
    const gameId = validateIdParam(req.params.id as string);
    const gameDetails = await getGameDetailsById(gameId);
    res.status(200).json(gameDetails);
  }

  static async platforms(req: Request, res: Response): Promise<void> {
    const gameId = validateIdParam(req.params.id as string);
    const gamePlatforms = await getGamePlatformsById(gameId);
    res.status(200).json(gamePlatforms);
  }

  static async updatePlatform(req: Request, res: Response): Promise<void> {
    const gameId = validateIdParam(req.params.id as string);
    const platformId = validatePlatformIdParam(req.params.platformId as string);
    const input = validateUpdateGamePlatformInput(req.body);
    const platformState = await updateGamePlatform(
      gameId,
      platformId,
      input,
      req.user?.id,
    );
    res.status(200).json(platformState);
  }

  static async addPlatformKeys(req: Request, res: Response): Promise<void> {
    const gameId = validateIdParam(req.params.id as string);
    const platformId = validatePlatformIdParam(req.params.platformId as string);
    const input = validateAddGamePlatformKeysInput(req.body);
    const result = await addKeysToGamePlatform(gameId, platformId, input);
    res.status(201).json(result);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const createdGame = await withTemporaryUploads(listUploadedGameMedia(req.files), async () => {
      const input = validateCreateGameInput(req.body);
      return createGame(input, readUploadedGameMediaFiles(req.files));
    });
    res.status(201).json(createdGame);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updatedGame = await withTemporaryUploads(listUploadedGameMedia(req.files), async () => {
      const gameId = validateIdParam(req.params.id as string);
      const input = validateUpdateGameInput(req.body);
      return updateGame(gameId, input, readUploadedGameMediaFiles(req.files));
    });
    res.status(200).json(updatedGame);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const gameId = validateIdParam(req.params.id as string);
    await deleteGame(gameId);
    res.status(204).send();
  }
}

export default GameController;
