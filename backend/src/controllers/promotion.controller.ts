import { Request, Response } from "express";
import {
  createPromotion,
  deletePromotion,
  getPromotionById,
  linkListingToPromotion,
  listPromotions,
  unlinkListingFromPromotion,
  updatePromotion,
} from "../services/promotion.service";
import { UploadedPromotionMediaFiles } from "../middlewares/image-upload.middleware";
import { withTemporaryUploads } from "../utils/with-temporary-uploads";
import {
  validateCreatePromotionInput,
  validateListPromotionsQuery,
  validatePromotionIdParam,
  validateUpdatePromotionInput,
} from "../validators/promotion.validator";
import { validateListingIdParam } from "../validators/listing.validator";

function readUploadedPromotionMediaFiles(files: Request["files"]) {
  const uploadedFiles = (files as UploadedPromotionMediaFiles | undefined) ?? {};

  return {
    coverFile: uploadedFiles.coverFile?.[0] ?? null,
    bannerFile: uploadedFiles.bannerFile?.[0] ?? null,
  };
}

function listUploadedPromotionMedia(files: Request["files"]) {
  const uploadedFiles = readUploadedPromotionMediaFiles(files);
  return [uploadedFiles.coverFile, uploadedFiles.bannerFile];
}

class PromotionController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListPromotionsQuery(req.query);
    const promotions = await listPromotions(query);
    res.status(200).json(promotions);
  }

  static async get(req: Request, res: Response): Promise<void> {
    const promotionId = validatePromotionIdParam(req.params.id as string);
    const promotion = await getPromotionById(promotionId);
    res.status(200).json(promotion);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const promotion = await withTemporaryUploads(listUploadedPromotionMedia(req.files), async () => {
      const input = validateCreatePromotionInput(req.body);
      return createPromotion(input, readUploadedPromotionMediaFiles(req.files));
    });
    res.status(201).json(promotion);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const promotion = await withTemporaryUploads(listUploadedPromotionMedia(req.files), async () => {
      const promotionId = validatePromotionIdParam(req.params.id as string);
      const input = validateUpdatePromotionInput(req.body);
      return updatePromotion(
        promotionId,
        input,
        readUploadedPromotionMediaFiles(req.files),
      );
    });
    res.status(200).json(promotion);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const promotionId = validatePromotionIdParam(req.params.id as string);
    await deletePromotion(promotionId);
    res.status(204).send();
  }

  static async addListing(req: Request, res: Response): Promise<void> {
    const promotionId = validatePromotionIdParam(req.params.id as string);
    const listingId = validateListingIdParam(req.params.listingId as string);
    const link = await linkListingToPromotion(promotionId, listingId);
    res.status(201).json(link);
  }

  static async removeListing(req: Request, res: Response): Promise<void> {
    const promotionId = validatePromotionIdParam(req.params.id as string);
    const listingId = validateListingIdParam(req.params.listingId as string);
    await unlinkListingFromPromotion(promotionId, listingId);
    res.status(204).send();
  }
}

export default PromotionController;
