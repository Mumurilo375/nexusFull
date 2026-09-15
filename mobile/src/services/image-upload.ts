export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

type ImageAssetReference = {
  mimeType?: string | null;
  fileName?: string | null;
  uri?: string | null;
};

export function getSupportedImageMimeType(asset: ImageAssetReference): string | null {
  const reportedMimeType = asset.mimeType?.toLowerCase().trim();
  if (reportedMimeType) {
    return SUPPORTED_IMAGE_MIME_TYPES.includes(
      reportedMimeType as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number],
    )
      ? reportedMimeType
      : null;
  }

  const fileReference = `${asset.fileName ?? ""} ${asset.uri ?? ""}`.toLowerCase();
  if (/\.jpe?g(?:$|[?#])/.test(fileReference)) return "image/jpeg";
  if (/\.png(?:$|[?#])/.test(fileReference)) return "image/png";
  if (/\.webp(?:$|[?#])/.test(fileReference)) return "image/webp";

  return null;
}

export function getImageUploadValidationMessage(
  asset: ImageAssetReference & { fileSize?: number | null },
): string | null {
  if (!getSupportedImageMimeType(asset)) {
    return "Escolha uma imagem JPG, PNG ou WEBP.";
  }

  if (typeof asset.fileSize === "number" && asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
    return "A imagem deve ter no máximo 5 MB.";
  }

  return null;
}

export function getImageFileName(prefix: string, mimeType: string): string {
  const normalizedMimeType = mimeType.toLowerCase().trim();
  let extension = "jpg";

  if (normalizedMimeType === "image/png") {
    extension = "png";
  } else if (normalizedMimeType === "image/webp") {
    extension = "webp";
  }

  return `${prefix}-${Date.now()}.${extension}`;
}
