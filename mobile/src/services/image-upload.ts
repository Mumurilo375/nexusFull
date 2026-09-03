export function getImageFileName(prefix: string, mimeType: string): string {
  const normalizedMimeType = mimeType.toLowerCase();
  let extension = "jpg";

  if (normalizedMimeType === "image/png") {
    extension = "png";
  } else if (normalizedMimeType === "image/webp") {
    extension = "webp";
  }

  return `${prefix}-${Date.now()}.${extension}`;
}
