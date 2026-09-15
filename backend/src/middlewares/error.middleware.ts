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

function translateErrorMessage(message: string): string {
  if (!message) {
    return "Ocorreu um erro na solicitação.";
  }

  if (message.includes("Email is already in use")) {
    return "Este email já está em uso.";
  }

  if (message.includes("Username is already in use")) {
    return "Este nome de usuário já está em uso.";
  }

  if (message.includes("CPF is already in use")) {
    return "Este CPF já está cadastrado.";
  }

  if (message.includes("Email cannot be changed")) {
    return "O email não pode ser alterado.";
  }

  if (message.includes("Invalid email or password")) {
    return "Email ou senha incorretos.";
  }

  if (message.includes("Invalid email format")) {
    return "Formato de email inválido.";
  }

  if (
    message.includes("Invalid CPF") ||
    message.includes("CPF must have 11 digits")
  ) {
    return "CPF inválido. Verifique os dados informados.";
  }

  if (message.includes("Password must")) {
    return "A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.";
  }

  if (message.includes("avatarUrl is too large")) {
    return "A imagem de perfil é muito grande. Escolha uma imagem menor.";
  }

  if (message.includes("Only image files are allowed")) {
    return "Envie apenas arquivos de imagem.";
  }

  if (message.includes("Only JPG, JPEG, PNG, and WEBP image files are allowed")) {
    return "Envie apenas imagens JPG, PNG ou WEBP.";
  }

  if (message.includes("Game cannot be deleted because it has order history")) {
    return "Este jogo já possui vendas registradas e não pode ser excluído. Desative-o em vez de excluir.";
  }

  if (message.includes("Category name is already in use")) {
    return "Já existe uma categoria com esse nome.";
  }

  if (message.includes("Platform name is already in use")) {
    return "Já existe uma plataforma com esse nome.";
  }

  if (message.includes("Platform slug is already in use")) {
    return "Já existe uma plataforma com esse identificador.";
  }

  if (message.includes("User not found")) {
    return "Usuário não encontrado.";
  }

  if (message.includes("User not authenticated")) {
    return "Usuário não autenticado.";
  }

  if (message.includes("You can only manage your own account")) {
    return "Você só pode gerenciar sua própria conta.";
  }

  if (message.includes("You can only view your own account")) {
    return "Você só pode visualizar sua própria conta.";
  }

  if (message.includes("Request body must be an object")) {
    return "Corpo da requisição inválido.";
  }

  if (message.includes("is required")) {
    return "Há campos obrigatórios não preenchidos.";
  }

  if (message.includes("not found")) {
    return "Recurso não encontrado.";
  }

  return "Ocorreu um erro na solicitação.";
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
