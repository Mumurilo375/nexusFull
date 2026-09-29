import { Request, Response } from "express";
import { createPlatform, deletePlatform, getPlatformById, listPlatforms, updatePlatform } from "../services/platform.service";
import { withTemporaryUploads } from "../utils/with-temporary-uploads";
import {
  validateCreatePlatformInput,
  validateIdParam,
  validateListPlatformsQuery,
  validateUpdatePlatformInput,
} from "../validators/platform.validator";

class PlatformController {
  static async list(req: Request, res: Response): Promise<void> {
    const paginationFilters = validateListPlatformsQuery(req.query);
    const platformsPage = await listPlatforms(paginationFilters);
    res.status(200).json(platformsPage);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const platformId = validateIdParam(req.params.id as string);
    const platform = await getPlatformById(platformId);
    res.status(200).json(platform);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const createdPlatform = await withTemporaryUploads([req.file], async () => {
      const newPlatformData = validateCreatePlatformInput(req.body);
      return createPlatform(newPlatformData, req.file);
    });
    res.status(201).json(createdPlatform);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updatedPlatform = await withTemporaryUploads([req.file], async () => {
      const platformId = validateIdParam(req.params.id as string);
      const updatedPlatformData = validateUpdatePlatformInput(req.body);
      return updatePlatform(
        platformId,
        updatedPlatformData,
        req.file,
      );
    });
    res.status(200).json(updatedPlatform);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const platformId = validateIdParam(req.params.id as string);
    await deletePlatform(platformId);
    res.status(204).send();
  }
}

export default PlatformController;
