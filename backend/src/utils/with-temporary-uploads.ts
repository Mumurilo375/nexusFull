import { deleteTemporaryUploads } from "./media-storage";

export async function withTemporaryUploads<T>(
  files: Array<Express.Multer.File | null | undefined>,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } finally {
    await deleteTemporaryUploads(files);
  }
}
