import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { Request, Response } from "express";
import { errorMiddleware } from "../../src/middlewares/error.middleware";
import {
  ensureMediaStorage,
  getTemporaryUploadRoot,
} from "../../src/utils/media-storage";

async function handleUploadError(
  error: { code: string; field?: string },
  request = {} as Request,
) {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await errorMiddleware(
    error,
    request,
    response as unknown as Response,
    jest.fn(),
  );

  return response;
}

describe("middleware de erro para upload", () => {
  it("informa o limite de tamanho da imagem", async () => {
    const response = await handleUploadError({ code: "LIMIT_FILE_SIZE" });

    expect(response.status).toHaveBeenCalledWith(413);
    expect(response.json).toHaveBeenCalledWith({
      code: "PAYLOAD_TOO_LARGE",
      message: "A imagem enviada ultrapassa o limite de 5 MB. Escolha uma imagem menor.",
    });
  });

  it("informa o limite específico da galeria", async () => {
    const response = await handleUploadError({
      code: "LIMIT_UNEXPECTED_FILE",
      field: "galleryFiles",
    });

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      code: "VALIDATION_ERROR",
      message: "Você pode enviar no máximo 12 imagens para a galeria.",
    });
  });

  it("não revela campos aceitos quando o campo é desconhecido", async () => {
    const response = await handleUploadError({
      code: "LIMIT_UNEXPECTED_FILE",
      field: "arquivoInesperado",
    });

    expect(response.json).toHaveBeenCalledWith({
      code: "VALIDATION_ERROR",
      message: "O campo de imagem enviado não é permitido nesta operação.",
    });
  });

  it("remove arquivos temporários quando o upload falha", async () => {
    await ensureMediaStorage();
    const temporaryPath = `${getTemporaryUploadRoot()}/${randomUUID()}.jpg`;
    await fs.writeFile(temporaryPath, Buffer.from([0xff, 0xd8, 0xff]));

    await handleUploadError(
      { code: "LIMIT_UNEXPECTED_FILE" },
      { file: { path: temporaryPath } } as Request,
    );

    await expect(fs.access(temporaryPath)).rejects.toThrow();
  });
});
