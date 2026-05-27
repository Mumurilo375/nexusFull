import { resolveAssetUrl } from "../../../services/assets";
import type { GameImage, GameResponse, GameValues, GalleryItem } from "../shared/admin.types";

export const emptyGame: GameValues = {
  title: "",
  description: "",
  longDescription: "",
  releaseDate: "",
  coverImageUrl: "",
  isActive: true,
  categoryIds: [],
};

function createGalleryKey() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function createExistingGalleryItem(image: GameImage): GalleryItem {
  const imageUrl = String(image.imageUrl ?? "").trim();

  return {
    key: `existing-${image.id}`,
    kind: "existing",
    id: image.id,
    imageUrl,
    previewUrl: resolveAssetUrl(imageUrl),
  };
}

export function createFileGalleryItem(file: File): GalleryItem {
  return {
    key: `file-${createGalleryKey()}`,
    kind: "file",
    imageUrl: "",
    previewUrl: URL.createObjectURL(file),
    file,
  };
}

export function createUrlGalleryItem(imageUrl: string): GalleryItem {
  return {
    key: `url-${createGalleryKey()}`,
    kind: "url",
    imageUrl,
    previewUrl: resolveAssetUrl(imageUrl),
  };
}

export function revokeGalleryItemPreview(galleryItem: GalleryItem) {
  if (galleryItem.kind === "file") {
    URL.revokeObjectURL(galleryItem.previewUrl);
  }
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

export function mapGameToValues(game: GameResponse): GameValues {
  return {
    title: game.title ?? "",
    description: game.description ?? "",
    longDescription: game.longDescription ?? "",
    releaseDate: game.releaseDate ?? "",
    coverImageUrl: game.coverImageUrl ?? "",
    isActive: game.isActive !== false,
    categoryIds: (game.categories ?? []).map((category) => category.id),
  };
}

export function buildGameFormData(
  values: GameValues,
  coverFile: File | null,
  galleryItems: GalleryItem[],
) {
  const formData = new FormData();
  const galleryFiles: File[] = [];

  formData.append("title", values.title.trim());
  formData.append("description", values.description.trim());
  formData.append("longDescription", values.longDescription.trim());
  formData.append("releaseDate", values.releaseDate.trim());
  formData.append("isActive", String(values.isActive));
  formData.append("categoryIds", JSON.stringify(values.categoryIds));

  if (values.coverImageUrl.trim()) {
    formData.append("coverImageUrl", values.coverImageUrl.trim());
  }

  if (coverFile) {
    formData.append("coverFile", coverFile);
  }

  formData.append(
    "galleryItems",
    JSON.stringify(
      galleryItems.map((galleryItem) => {
        if (galleryItem.kind === "existing") {
          return { kind: "existing", id: galleryItem.id };
        }

        if (galleryItem.kind === "url") {
          return { kind: "url", url: galleryItem.imageUrl };
        }

        const fileIndex = galleryFiles.push(galleryItem.file as File) - 1;
        return { kind: "file", fileIndex };
      }),
    ),
  );

  galleryFiles.forEach((file) => formData.append("galleryFiles", file));
  return formData;
}

