import path from "path";
import { AppError } from "./app-error";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const imageTypes: Record<string, string[]> = {
  ".jpg": ["image/jpeg", "image/jpg"],
  ".jpeg": ["image/jpeg", "image/jpg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};

export function getImageExtension(
  originalName: string,
  mimeType: string,
): string | null {
  const extension = path.extname(path.basename(originalName)).toLowerCase();
  const allowedMimeTypes = imageTypes[extension];

  if (!allowedMimeTypes?.includes(mimeType.toLowerCase().trim())) {
    return null;
  }

  return extension;
}

export function assertValidImageMetadata(
  file: Pick<Express.Multer.File, "originalname" | "mimetype">,
): string {
  const extension = getImageExtension(file.originalname, file.mimetype);

  if (!extension) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Only JPG, JPEG, PNG, and WEBP image files are allowed",
    );
  }

  return extension;
}
