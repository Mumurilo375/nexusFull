import { Request, Response } from "express";
import {
  bulkCreateGameKeys,
  bulkDeleteGameKeys,
  createGameKey,
  deleteGameKey,
  getGameKeyById,
  listGameKeys,
  updateGameKey,
} from "../services/game-key.service";
import {
  validateBulkCreateGameKeysInput,
  validateBulkDeleteGameKeysInput,
  validateCreateGameKeyInput,
  validateGameKeyIdParam,
  validateListGameKeysQuery,
  validateUpdateGameKeyInput,
} from "../validators/game-key.validator";

class GameKeyController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListGameKeysQuery(req.query);
    const keys = await listGameKeys(query);
    res.status(200).json(keys);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const gameKeyId = validateGameKeyIdParam(req.params.id as string);
    const key = await getGameKeyById(gameKeyId);
    res.status(200).json(key);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const input = validateCreateGameKeyInput(req.body);
    const key = await createGameKey(input);
    res.status(201).json(key);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const gameKeyId = validateGameKeyIdParam(req.params.id as string);
    const input = validateUpdateGameKeyInput(req.body);
    const key = await updateGameKey(gameKeyId, input);
    res.status(200).json(key);
  }

  static async bulkCreate(req: Request, res: Response): Promise<void> {
    const input = validateBulkCreateGameKeysInput(req.body);
    const result = await bulkCreateGameKeys(input);
    res.status(201).json(result);
  }

  static async bulkDelete(req: Request, res: Response): Promise<void> {
    const input = validateBulkDeleteGameKeysInput(req.body);
    const result = await bulkDeleteGameKeys(input);
    res.status(200).json(result);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const gameKeyId = validateGameKeyIdParam(req.params.id as string);
    await deleteGameKey(gameKeyId);
    res.status(204).send();
  }
}

export default GameKeyController;
