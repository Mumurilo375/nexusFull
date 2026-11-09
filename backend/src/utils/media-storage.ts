import { randomUUID } from "crypto";
import { constants, promises as fs } from "fs";
import os from "os";
import path from "path";
import { AppError } from "./app-error";
import { getImageExtension } from "./image-upload";

const mediaPrefix = "/media";
const backendRoot = path.resolve(__dirname, "..", "..");
const storageRoot = path.join(backendRoot, "storage");
const temporaryUploadRoot = process.env.VERCEL
  ? path.join(os.tmpdir(), "nexus-uploads")
  : path.join(storageRoot, "tmp");
const mediaDirectories = ["tmp", "games", "offers", "platforms", "users", "legacy"];

type SupabaseStorageConfig = {
  url: string;
  serviceKey: string;
  bucket: string;
};

function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const serviceKey = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim();
  const configuredCount = [url, serviceKey, bucket].filter(Boolean).length;

  if (configuredCount === 0) return null;
  if (configuredCount !== 3 || !url || !serviceKey || !bucket) {
    throw new AppError(500, "STORAGE_CONFIG_ERROR", "O armazenamento de imagens não está configurado.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new AppError(500, "STORAGE_CONFIG_ERROR", "O armazenamento de imagens não está configurado.");
  }

  if (
    (parsedUrl.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsedUrl.protocol === "http:")) ||
    !/^[a-zA-Z0-9._-]+$/.test(bucket)
  ) {
    throw new AppError(500, "STORAGE_CONFIG_ERROR", "O armazenamento de imagens não está configurado.");
  }

  return { url: parsedUrl.origin, serviceKey, bucket };
}

function normalizeStorageObjectPath(value: string) {
  const segments = value.replace(/\\/g, "/").split("/");
  if (
    segments.length === 0 ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return null;
  }
  return segments.join("/");
}

function getStorageObjectEndpoint(config: SupabaseStorageConfig, objectPath: string) {
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  return `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodedPath}`;
}

async function uploadStorageObject(
  objectPath: string,
  contents: Buffer,
  contentType: string,
) {
  const config = getSupabaseStorageConfig();
  const safeObjectPath = normalizeStorageObjectPath(objectPath);
  if (!config || !safeObjectPath) {
    throw new AppError(500, "STORAGE_CONFIG_ERROR", "O armazenamento de imagens não está configurado.");
  }

  const response = await fetch(getStorageObjectEndpoint(config, safeObjectPath), {
    method: "POST",
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      "Content-Type": contentType,
      "x-upsert": "false",
      "cache-control": "31536000",
    },
    body: new Uint8Array(contents),
    signal: AbortSignal.timeout(15_000),
    redirect: "error",
  });

  if (!response.ok) {
    throw new AppError(502, "STORAGE_UPLOAD_FAILED", "Não foi possível salvar a imagem.");
  }
}

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
  if (getSupabaseStorageConfig()) return;

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

export function getPublicStorageObjectUrl(objectPath: string) {
  const config = getSupabaseStorageConfig();
  const safeObjectPath = normalizeStorageObjectPath(objectPath);
  if (!config || !safeObjectPath) {
    throw new AppError(404, "MEDIA_NOT_FOUND", "Imagem não encontrada.");
  }

  const encodedPath = safeObjectPath.split("/").map(encodeURIComponent).join("/");
  return `${config.url}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${encodedPath}`;
}

export function hasSupabaseStorageConfigured() {
  return Boolean(getSupabaseStorageConfig());
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
  const config = getSupabaseStorageConfig();
  if (config && value && isManagedMediaUrl(value)) {
    const objectPath = normalizeStorageObjectPath(value.slice(mediaPrefix.length + 1));
    if (!objectPath) return;

    const response = await fetch(getStorageObjectEndpoint(config, objectPath), {
      method: "DELETE",
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
      },
      signal: AbortSignal.timeout(15_000),
      redirect: "error",
    });
    if (!response.ok && response.status !== 404) {
      throw new AppError(502, "STORAGE_DELETE_FAILED", "Não foi possível excluir a imagem.");
    }
    return;
  }

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
    throw new AppError(400, "VALIDATION_ERROR", "A imagem enviada é inválida.");
  }

  const relativeObjectPath = normalizeStorageObjectPath(
    [...destination.map(String), `${randomUUID()}${extension}`].join("/"),
  );
  if (!relativeObjectPath) {
    throw new AppError(400, "VALIDATION_ERROR", "A imagem enviada é inválida.");
  }

  if (getSupabaseStorageConfig()) {
    const content = await fs.readFile(sourcePath);
    await uploadStorageObject(relativeObjectPath, content, file.mimetype);
    await fs.unlink(sourcePath);
    return createManagedMediaUrl(relativeObjectPath);
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

  const storageConfig = getSupabaseStorageConfig();
  if (storageConfig) {
    const objectPath = normalizeStorageObjectPath(normalizedTarget);
    if (!objectPath) return null;
    const contents = await fs.readFile(sourcePath);
    const extension = path.extname(sourcePath).toLowerCase();
    const contentType = extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : "image/jpeg";
    await uploadStorageObject(objectPath, contents, contentType);
    return createManagedMediaUrl(objectPath);
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);

  return createManagedMediaUrl(normalizedTarget);
}
