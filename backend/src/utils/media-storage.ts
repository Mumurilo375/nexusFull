import { randomUUID } from "crypto";
import { constants, promises as fs } from "fs";
import path from "path";
import { AppError } from "./app-error";
import { getImageExtension } from "./image-upload";

const mediaPrefix = "/media";
const backendRoot = path.resolve(__dirname, "..", "..");
const storageRoot = path.join(backendRoot, "storage");
const temporaryUploadRoot = path.join(storageRoot, "tmp");
const mediaDirectories = ["tmp", "games", "offers", "platforms", "users", "legacy"];

function normalizeRelativePath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\/+/, "");
}

function isInsideDirectory(directory: string, targetPath: string) {
  const resolvedDirectory = path.resolve(directory);
  const resolvedTargetPath = path.resolve(targetPath);

  return (
    resolvedTargetPath !== resolvedDirectory &&
    resolvedTargetPath.startsWith(`${resolvedDirectory}${path.sep}`)
  );
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

  while (isInsideDirectory(storageRoot, currentDirectory)) {
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
  await Promise.all(
    mediaDirectories.map((directory) =>
      fs.mkdir(path.join(storageRoot, directory), { recursive: true }),
    ),
  );
}

export function createManagedMediaUrl(relativePath: string) {
  return `${mediaPrefix}/${normalizeRelativePath(relativePath)}`;
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

  return isInsideDirectory(storageRoot, absolutePath) ? absolutePath : null;
}

export async function deleteManagedMedia(value?: string | null) {
  const absolutePath = value ? getManagedMediaAbsolutePath(value) : null;
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
  const isTemporaryFile = isInsideDirectory(temporaryUploadRoot, absolutePath);

  if (!isTemporaryFile || !(await pathExists(absolutePath))) {
    return;
  }

  await fs.unlink(absolutePath);
}

export async function deleteTemporaryUploads(files: Array<Express.Multer.File | null | undefined>) {
  await Promise.all(files.map((file) => deleteTemporaryUpload(file)));
}

async function moveUploadedMedia(
  file: Express.Multer.File,
  ...destination: Array<string | number>
) {
  const extension = getImageExtension(file.originalname, file.mimetype);
  const sourcePath = path.resolve(file.path);

  if (!extension || !isInsideDirectory(temporaryUploadRoot, sourcePath)) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid uploaded image");
  }

  const targetDirectory = path.join(storageRoot, ...destination.map(String));
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
  gameId: number,
  kind: "cover" | "gallery",
) {
  return moveUploadedMedia(file, "games", gameId, kind);
}

export async function moveUploadedUserAvatar(
  file: Express.Multer.File,
  userId: number,
) {
  return moveUploadedMedia(file, "users", userId, "avatar");
}

export async function moveUploadedPromotionImage(
  file: Express.Multer.File,
  promotionId: number,
  kind: "cover" | "banner",
) {
  return moveUploadedMedia(file, "offers", promotionId, kind);
}

export async function moveUploadedPlatformIcon(
  file: Express.Multer.File,
  platformId: number,
) {
  return moveUploadedMedia(file, "platforms", platformId, "icon");
}

export async function ensureManagedLegacyMedia(
  sourceRelativePath: string,
  targetRelativePath: string,
) {
  const normalizedSource = normalizeRelativePath(sourceRelativePath);
  const normalizedTarget = normalizeRelativePath(targetRelativePath);
  const targetPath = path.resolve(storageRoot, normalizedTarget);

  if (!isInsideDirectory(storageRoot, targetPath)) {
    return null;
  }

  if (await pathExists(targetPath)) {
    return createManagedMediaUrl(normalizedTarget);
  }

  const publicRoot = path.resolve(backendRoot, "..", "frontend", "public");
  const sourcePath = path.resolve(publicRoot, normalizedSource);

  const isPublicFile = isInsideDirectory(publicRoot, sourcePath);
  if (!isPublicFile || !(await pathExists(sourcePath))) {
    return null;
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);

  return createManagedMediaUrl(normalizedTarget);
}
