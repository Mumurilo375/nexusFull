import { NextFunction, Request, Response } from "express";
import { isAppError } from "../utils/app-error";
import { deleteTemporaryUploads } from "../utils/media-storage";
import { ErrorLike } from "../utils/value-types";

type PayloadTooLargeError = {
  type?: string;
  status?: number;
  statusCode?: number;
};

type MulterError = {
  code?: string;
  field?: string;
};

const multerErrorMessages: Record<string, string> = {
  LIMIT_FILE_SIZE:
    "A imagem enviada ultrapassa o limite de 5 MB. Escolha uma imagem menor.",
  LIMIT_FILE_COUNT: "Você pode enviar no máximo 13 imagens por vez.",
  LIMIT_FIELD_COUNT:
    "A requisição contém campos demais. Revise as imagens e tente novamente.",
  LIMIT_PART_COUNT:
    "A requisição contém campos demais. Revise as imagens e tente novamente.",
  LIMIT_FIELD_KEY: "O nome de um campo enviado é muito longo.",
  LIMIT_FIELD_VALUE: "Um dos campos enviados é muito grande.",
  LIMIT_HEADER_COUNT: "Os dados do envio de imagem são inválidos.",
};

const unexpectedFileMessages = new Map<string, string>([
  ["avatarFile", "Envie somente uma foto de perfil no campo correto."],
  ["iconFile", "Envie somente um ícone de plataforma no campo correto."],
  ["coverFile", "Envie somente uma imagem de capa no campo correto."],
  ["bannerFile", "Envie somente uma imagem de banner no campo correto."],
  ["galleryFiles", "Você pode enviar no máximo 12 imagens para a galeria."],
]);

function getUploadedFiles(req: Request): Express.Multer.File[] {
  if (req.file) {
    return [req.file];
  }

  if (!req.files) {
    return [];
  }

  return Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
}

function isPayloadTooLargeError(
  error: ErrorLike,
): error is PayloadTooLargeError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as PayloadTooLargeError;
  return (
    candidate.type === "entity.too.large" ||
    candidate.status === 413 ||
    candidate.statusCode === 413
  );
}

function isMulterError(error: ErrorLike): error is MulterError {
  if (!error || typeof error !== "object") {
    return false;
  }

  return [
    "LIMIT_FILE_SIZE",
    "LIMIT_FILE_COUNT",
    "LIMIT_UNEXPECTED_FILE",
    "LIMIT_FIELD_COUNT",
    "LIMIT_FIELD_KEY",
    "LIMIT_FIELD_VALUE",
    "LIMIT_HEADER_COUNT",
    "LIMIT_PART_COUNT",
  ].includes((error as MulterError).code ?? "");
}

const translations: [string, string][] = [
  ["Email is already in use", "Este email já está em uso."],
  ["Username is already in use", "Este nome de usuário já está em uso."],
  ["CPF is already in use", "Este CPF já está cadastrado."],
  ["Email cannot be changed", "O email não pode ser alterado."],
  ["Invalid email or password", "Email ou senha incorretos."],
  ["Invalid email format", "Formato de email inválido."],
  ["Invalid CPF", "CPF inválido. Verifique os dados informados."],
  ["CPF must have 11 digits", "CPF inválido. Verifique os dados informados."],
  ["Password must", "A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial."],
  ["avatarUrl is too large", "A imagem de perfil é muito grande. Escolha uma imagem menor."],
  ["Only image files are allowed", "Envie apenas arquivos de imagem."],
  ["Only JPG, JPEG, PNG, and WEBP image files are allowed", "Envie apenas imagens JPG, PNG ou WEBP."],
  ["Game cannot be deleted because it has order history", "Este jogo já possui vendas registradas e não pode ser excluído. Desative-o em vez de excluir."],
  ["Category name is already in use", "Já existe uma categoria com esse nome."],
  ["Platform name is already in use", "Já existe uma plataforma com esse nome."],
  ["Platform slug is already in use", "Já existe uma plataforma com esse identificador."],
  ["User not found", "Usuário não encontrado."],
  ["User not authenticated", "Usuário não autenticado."],
  ["You can only manage your own account", "Você só pode gerenciar sua própria conta."],
  ["You can only view your own account", "Você só pode visualizar sua própria conta."],
  ["Request body must be an object", "Corpo da requisição inválido."],
  ["is required", "Há campos obrigatórios não preenchidos."],
  ["not found", "Recurso não encontrado."],
];

function translateErrorMessage(message: string): string {
  return translations.find(([fragment]) => message.includes(fragment))?.[1]
    ?? "Ocorreu um erro na solicitação.";
}

function getMulterErrorMessage(error: MulterError): string {
  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return (
      unexpectedFileMessages.get(error.field ?? "") ??
      "O campo de imagem enviado não é permitido nesta operação."
    );
  }

  return (
    multerErrorMessages[error.code ?? ""] ??
    "Não foi possível processar o envio das imagens. Tente novamente."
  );
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    code: "ROUTE_NOT_FOUND",
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
}

export async function errorMiddleware(
  error: ErrorLike,
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  await deleteTemporaryUploads(getUploadedFiles(req)).catch(() => undefined);

  if (isPayloadTooLargeError(error)) {
    res.status(413).json({
      code: "PAYLOAD_TOO_LARGE",
      message: "O envio de dados é muito grande.",
    });
    return;
  }

  if (isMulterError(error)) {
    const isFileTooLarge = error.code === "LIMIT_FILE_SIZE";

    res.status(isFileTooLarge ? 413 : 400).json({
      code: isFileTooLarge ? "PAYLOAD_TOO_LARGE" : "VALIDATION_ERROR",
      message: getMulterErrorMessage(error),
    });
    return;
  }

  if (isAppError(error)) {
    res.status(error.statusCode).json({
      code: error.code,
      message: translateErrorMessage(error.message),
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Erro interno do servidor.",
  });
}
