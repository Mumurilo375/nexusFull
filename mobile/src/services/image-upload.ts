export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

type ImageAssetReference = {
  mimeType?: string | null;
  fileName?: string | null;
  uri?: string | null;
};

export function getSupportedImageMimeType(asset: ImageAssetReference): string | null {
  const rawMimeType = asset.mimeType?.toLowerCase().trim();
  const reportedMimeType = rawMimeType ? MIME_ALIASES[rawMimeType] ?? rawMimeType : "";
  if (reportedMimeType && !["application/octet-stream", "image/*"].includes(reportedMimeType)) {
    return SUPPORTED_IMAGE_MIME_TYPES.includes(
      reportedMimeType as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number],
    )
      ? reportedMimeType
      : null;
  }

  const references = [asset.fileName, asset.uri].map((value) => value?.toLowerCase() ?? "");
  if (references.some((value) => /\.jpe?g(?:$|[?#])/.test(value))) return "image/jpeg";
  if (references.some((value) => /\.png(?:$|[?#])/.test(value))) return "image/png";
  if (references.some((value) => /\.webp(?:$|[?#])/.test(value))) return "image/webp";

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

export function appendImageFile(
  formData: FormData,
  field: string,
  image: { uri: string; name: string; type: string; file?: Blob },
): void {
  const { file, ...nativeFile } = image;

  if (file) {
    formData.append(field, file, image.name);
    return;
  }

  formData.append(field, nativeFile as unknown as Blob);
}
