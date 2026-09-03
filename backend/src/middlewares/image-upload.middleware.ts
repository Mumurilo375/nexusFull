import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import multer from "multer";
import { getTemporaryUploadRoot } from "../utils/media-storage";
import {
  assertValidImageMetadata,
  MAX_IMAGE_SIZE_BYTES,
} from "../utils/image-upload";

const temporaryUploadRoot = getTemporaryUploadRoot();

mkdirSync(temporaryUploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, temporaryUploadRoot);
  },
  filename: (_request, file, callback) => {
    callback(null, `${randomUUID()}${assertValidImageMetadata(file)}`);
  },
});

function imageFilter(
  _request: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  try {
    assertValidImageMetadata(file);
    callback(null, true);
  } catch (error) {
    callback(error as Error);
  }
}

const imageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 13,
  },
});

export const gameMediaFields = imageUpload.fields([
  { name: "coverFile", maxCount: 1 },
  { name: "galleryFiles", maxCount: 12 },
]);

export const userAvatarUpload = imageUpload.single("avatarFile");

export const platformIconUpload = imageUpload.single("iconFile");

export const promotionMediaFields = imageUpload.fields([
  { name: "coverFile", maxCount: 1 },
  { name: "bannerFile", maxCount: 1 },
]);

export type UploadedGameMediaFiles = {
  coverFile?: Express.Multer.File[];
  galleryFiles?: Express.Multer.File[];
};

export type UploadedPromotionMediaFiles = {
  coverFile?: Express.Multer.File[];
  bannerFile?: Express.Multer.File[];
};
