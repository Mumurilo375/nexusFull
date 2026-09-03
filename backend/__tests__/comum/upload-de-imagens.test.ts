import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  deleteManagedMediaList,
  ensureMediaStorage,
  getManagedMediaAbsolutePath,
  getStorageRoot,
  getTemporaryUploadRoot,
  moveUploadedGameImage,
} from "../../src/utils/media-storage";
import {
  assertValidImageMetadata,
  MAX_IMAGE_SIZE_BYTES,
} from "../../src/utils/image-upload";

describe("upload de imagens", () => {
  it("aceita somente extensões e MIME correspondentes", () => {
    expect(assertValidImageMetadata({ originalname: "capa.jpg", mimetype: "image/jpeg" })).toBe(".jpg");
    expect(assertValidImageMetadata({ originalname: "capa.webp", mimetype: "image/webp" })).toBe(".webp");
    expect(() => assertValidImageMetadata({ originalname: "capa.exe", mimetype: "image/jpeg" })).toThrow();
    expect(() => assertValidImageMetadata({ originalname: "capa.jpg", mimetype: "image/png" })).toThrow();
  });

  it("usa o limite de 5 MB", () => {
    expect(MAX_IMAGE_SIZE_BYTES).toBe(5 * 1024 * 1024);
  });

  it("gera nomes diferentes para arquivos com o mesmo nome original", async () => {
    await ensureMediaStorage();
    const firstPath = path.join(getTemporaryUploadRoot(), `${randomUUID()}.tmp`);
    const secondPath = path.join(getTemporaryUploadRoot(), `${randomUUID()}.tmp`);
    const imageContent = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
    const firstFile = {
      path: firstPath,
      originalname: "capa.jpg",
      mimetype: "image/jpeg",
    } as Express.Multer.File;
    const secondFile = {
      path: secondPath,
      originalname: "capa.jpg",
      mimetype: "image/jpeg",
    } as Express.Multer.File;

    await fs.writeFile(firstPath, imageContent);
    await fs.writeFile(secondPath, imageContent);

    const urls = await Promise.all([
      moveUploadedGameImage(firstFile, { gameId: 99999, kind: "gallery" }),
      moveUploadedGameImage(secondFile, { gameId: 99999, kind: "gallery" }),
    ]);

    try {
      expect(urls[0]).not.toBe(urls[1]);
      expect(getManagedMediaAbsolutePath(urls[0])).not.toBeNull();
      expect(getManagedMediaAbsolutePath(urls[1])).not.toBeNull();
    } finally {
      await deleteManagedMediaList(urls);
      await fs.rm(path.join(getStorageRoot(), "games", "99999"), { recursive: true, force: true });
    }
  });
});
