import { Request, Response } from "express";
import { createGameTag, deleteGameTag, listGameTags } from "../services/game-tag.service";
import {
  validateCreateGameTagInput,
  validateGameTagParams,
  validateListGameTagsQuery,
} from "../validators/game-tag.validator";

class GameTagController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListGameTagsQuery(req.query);
    const gameTags = await listGameTags(query);
    res.status(200).json(gameTags);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const input = validateCreateGameTagInput(req.body);
    const gameTag = await createGameTag(input);
    res.status(201).json(gameTag);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const params = validateGameTagParams(req.params.gameId as string, req.params.tagId as string);
    await deleteGameTag(params.gameId, params.tagId);
    res.status(204).send();
  }
}

export default GameTagController;
