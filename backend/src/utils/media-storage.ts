import { constants, promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import { AppError } from "./app-error";
import { getImageExtension } from "./image-upload";

const mediaPrefix = "/media";
const backendRoot = path.resolve(__dirname, "..", "..");
const storageRoot = path.join(backendRoot, "storage");
const temporaryUploadRoot = path.join(storageRoot, "tmp");

function normalizeSlashes(value: string) {
  return value.replace(/\\/g, "/");
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function removeEmptyDirectories(startDirectory: string) {
  let currentDirectory = startDirectory;

  while (
    currentDirectory.startsWith(`${storageRoot}${path.sep}`) &&
    currentDirectory !== storageRoot
  ) {
    let entries: string[];

    try {
      entries = await fs.readdir(currentDirectory);
    } catch {
      return;
    }

    if (entries.length > 0) {
      return;
    }

    try {
      await fs.rmdir(currentDirectory);
    } catch {
      return;
    }

    currentDirectory = path.dirname(currentDirectory);
  }
}

export function getStorageRoot() {
  return storageRoot;
}

export function getTemporaryUploadRoot() {
  return temporaryUploadRoot;
}

export async function ensureMediaStorage() {
  await Promise.all([
    fs.mkdir(temporaryUploadRoot, { recursive: true }),
    fs.mkdir(path.join(storageRoot, "games"), { recursive: true }),
    fs.mkdir(path.join(storageRoot, "offers"), { recursive: true }),
    fs.mkdir(path.join(storageRoot, "platforms"), { recursive: true }),
    fs.mkdir(path.join(storageRoot, "users"), { recursive: true }),
    fs.mkdir(path.join(storageRoot, "legacy"), { recursive: true }),
  ]);
}

export function createManagedMediaUrl(relativePath: string) {
  const safeRelativePath = normalizeSlashes(relativePath).replace(/^\/+/, "");
  return `${mediaPrefix}/${safeRelativePath}`;
}

export function isManagedMediaUrl(value?: string | null) {
  return Boolean(value && value.startsWith(`${mediaPrefix}/`));
}

export function getManagedMediaAbsolutePath(value: string) {
  if (!isManagedMediaUrl(value)) {
    return null;
  }

  const relativePath = value.slice(mediaPrefix.length).replace(/^\/+/, "");
  const absolutePath = path.resolve(storageRoot, relativePath);

  if (
    absolutePath === storageRoot ||
    !absolutePath.startsWith(`${storageRoot}${path.sep}`)
  ) {
    return null;
  }

  return absolutePath;
}

export async function deleteManagedMedia(value?: string | null) {
  if (!value || !isManagedMediaUrl(value)) {
    return;
  }

  const absolutePath = getManagedMediaAbsolutePath(value);
  if (!absolutePath || !(await pathExists(absolutePath))) {
    return;
  }

  await fs.unlink(absolutePath);
  await removeEmptyDirectories(path.dirname(absolutePath));
}

export async function deleteManagedMediaList(values: Array<string | null | undefined>) {
  for (const value of values) {
    await deleteManagedMedia(value);
  }
}

export async function deleteTemporaryUpload(file?: Express.Multer.File | null) {
  if (!file?.path) {
    return;
  }
  const absolutePath = path.resolve(file.path);

  if (
    !absolutePath.startsWith(`${temporaryUploadRoot}${path.sep}`) ||
    !(await pathExists(absolutePath))
  ) {
    return;
  }

  await fs.unlink(absolutePath);
}

export async function deleteTemporaryUploads(files: Array<Express.Multer.File | null | undefined>) {
  await Promise.all(files.map((file) => deleteTemporaryUpload(file)));
}

function isInsideDirectory(directory: string, targetPath: string) {
  const resolvedDirectory = path.resolve(directory);
  const resolvedTargetPath = path.resolve(targetPath);
  return (
    resolvedTargetPath !== resolvedDirectory &&
    resolvedTargetPath.startsWith(`${resolvedDirectory}${path.sep}`)
  );
}

async function moveUploadedMedia(
  file: Express.Multer.File,
  targetDirectory: string,
) {
  const extension = getImageExtension(file.originalname, file.mimetype);
  const sourcePath = path.resolve(file.path);

  if (!extension || !isInsideDirectory(temporaryUploadRoot, sourcePath)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid uploaded image");
  }

  await fs.mkdir(targetDirectory, { recursive: true });
  const targetPath = path.join(targetDirectory, `${randomUUID()}${extension}`);
  let copied = false;

  try {
    await fs.copyFile(sourcePath, targetPath, constants.COPYFILE_EXCL);
    copied = true;
    await fs.unlink(sourcePath);
    return createManagedMediaUrl(path.relative(storageRoot, targetPath));
  } catch (error) {
    if (copied) {
      await fs.unlink(targetPath).catch(() => undefined);
    }

    throw error;
  }
}

export async function moveUploadedGameImage(
  file: Express.Multer.File,
  options: { gameId: number; kind: "cover" | "gallery" },
) {
  return moveUploadedMedia(
    file,
    path.join(storageRoot, "games", String(options.gameId), options.kind),
  );
}

export async function moveUploadedUserAvatar(
  file: Express.Multer.File,
  options: { userId: number },
) {
  return moveUploadedMedia(
    file,
    path.join(storageRoot, "users", String(options.userId), "avatar"),
  );
}

export async function moveUploadedPromotionCover(
  file: Express.Multer.File,
  options: { promotionId: number },
) {
  return moveUploadedMedia(
    file,
    path.join(storageRoot, "offers", String(options.promotionId), "cover"),
  );
}

export async function moveUploadedPromotionBanner(
  file: Express.Multer.File,
  options: { promotionId: number },
) {
  return moveUploadedMedia(
    file,
    path.join(storageRoot, "offers", String(options.promotionId), "banner"),
  );
}

export async function moveUploadedPlatformIcon(
  file: Express.Multer.File,
  options: { platformId: number },
) {
  return moveUploadedMedia(
    file,
    path.join(storageRoot, "platforms", String(options.platformId), "icon"),
  );
}

export async function ensureManagedLegacyMedia(
  sourceRelativePath: string,
  targetRelativePath: string,
) {
  const normalizedSource = normalizeSlashes(sourceRelativePath).replace(/^\/+/, "");
  const normalizedTarget = normalizeSlashes(targetRelativePath).replace(/^\/+/, "");
  const targetPath = path.resolve(storageRoot, normalizedTarget);

  if (!isInsideDirectory(storageRoot, targetPath)) {
    return null;
  }

  if (!(await pathExists(targetPath))) {
    const publicRoot = path.resolve(backendRoot, "..", "frontend", "public");
    const sourcePath = path.resolve(publicRoot, normalizedSource);

    if (!isInsideDirectory(publicRoot, sourcePath)) {
      return null;
    }

    if (!(await pathExists(sourcePath))) {
      return null;
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
  }

  return createManagedMediaUrl(normalizedTarget);
}
