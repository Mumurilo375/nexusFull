import { isAxiosError } from "axios";

export type ApiErrorPayload = {
  code?: string;
  message?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type HttpErrorInput =
  | Error
  | {
      message?: string;
      response?: {
        data?: ApiErrorPayload | string;
        status?: number;
      };
    }
  | null
  | undefined;

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

const DEFAULT_CLIENT_ERROR_MESSAGE =
  "Não conseguimos concluir essa ação agora. Tente novamente em instantes.";
const RESOURCE_NOT_FOUND_MESSAGE =
  "Não encontramos o conteúdo que você tentou acessar.";
const SESSION_EXPIRED_MESSAGE =
  "Sua sessão expirou. Faça login novamente para continuar.";

function normalizeErrorText(value: string): string {
  return value.trim();
}

function normalizeComparisonText(value: string): string {
  return normalizeErrorText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getStatusErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Algumas informações precisam ser revisadas para continuar.";
    case 401:
      return SESSION_EXPIRED_MESSAGE;
    case 403:
      return "Você não tem permissão para acessar esta área.";
    case 404:
      return RESOURCE_NOT_FOUND_MESSAGE;
    case 409:
      return "Algumas informações já estão em uso. Revise os dados e tente novamente.";
    case 413:
      return "O arquivo enviado é maior do que o permitido. Escolha um arquivo menor.";
    case 422:
      return "Alguns dados precisam ser corrigidos para continuar.";
    case 429:
      return "Muitas tentativas em sequência. Aguarde um instante e tente novamente.";
    default:
      return status >= 500
        ? "Estamos com uma instabilidade no momento. Tente novamente em instantes."
        : DEFAULT_CLIENT_ERROR_MESSAGE;
  }
}

function getCodeErrorMessage(code: string): string | null {
  const normalizedCode = normalizeErrorText(code).toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  if (normalizedCode.endsWith("_NOT_FOUND") || normalizedCode === "ROUTE_NOT_FOUND") {
    return RESOURCE_NOT_FOUND_MESSAGE;
  }

  if (normalizedCode === "LISTING_ALREADY_EXISTS") {
    return "Essa plataforma já está cadastrada para este jogo.";
  }

  if (normalizedCode === "GAME_KEY_ALREADY_EXISTS") {
    return "Uma ou mais keys informadas já estão cadastradas.";
  }

  if (normalizedCode === "GAME_HAS_ORDER_HISTORY") {
    return "Este jogo já possui vendas registradas e não pode ser excluído. Desative-o em vez de excluir.";
  }

  if (normalizedCode === "REVIEW_ALREADY_EXISTS") {
    return "Você já avaliou este jogo.";
  }

  if (normalizedCode === "OUT_OF_STOCK") {
    return "Este item está indisponível no momento.";
  }

  if (normalizedCode === "EMAIL_ALREADY_EXISTS") {
    return "Este email já está em uso.";
  }

  if (normalizedCode === "USERNAME_ALREADY_EXISTS") {
    return "Este nome de usuário já está em uso.";
  }

  if (normalizedCode === "CPF_ALREADY_EXISTS") {
    return "Este CPF já está cadastrado.";
  }

  if (normalizedCode.endsWith("_ALREADY_EXISTS")) {
    return "Algumas informações já estão em uso. Revise os dados e tente novamente.";
  }

  switch (normalizedCode) {
    case "UNAUTHORIZED":
      return SESSION_EXPIRED_MESSAGE;
    case "FORBIDDEN":
      return "Você não tem permissão para acessar esta área.";
    case "INVALID_CREDENTIALS":
      return "Email ou senha incorretos.";
    case "VALIDATION_ERROR":
      return null;
    case "PAYLOAD_TOO_LARGE":
      return "O arquivo enviado é maior do que o permitido. Escolha um arquivo menor.";
    default:
      return null;
  }
}

function getKnownMessageTranslation(message: string, status?: number): string | null {
  const normalizedMessage = normalizeErrorText(message);
  const lowercaseMessage = normalizeComparisonText(normalizedMessage);

  if (!normalizedMessage) {
    return null;
  }

  if (normalizedMessage.includes("Network Error")) {
    return "Não foi possível se conectar agora. Confira sua internet e tente novamente.";
  }

  if (/^Request failed with status code \d{3}$/i.test(normalizedMessage) && status) {
    return getStatusErrorMessage(status);
  }

  if (
    lowercaseMessage.includes("unexpected server error") ||
    lowercaseMessage.includes("erro interno do servidor")
  ) {
    return getStatusErrorMessage(status ?? 500);
  }

  if (
    lowercaseMessage.includes("unexpected request error") ||
    lowercaseMessage.includes("ocorreu um erro na solicitacao")
  ) {
    return DEFAULT_CLIENT_ERROR_MESSAGE;
  }

  if (
    lowercaseMessage.includes("payload too large") ||
    lowercaseMessage.includes("o envio de dados e muito grande")
  ) {
    return "O arquivo enviado é maior do que o permitido. Escolha um arquivo menor.";
  }

  if (
    lowercaseMessage.includes("token not provided") ||
    lowercaseMessage.includes("user not authenticated") ||
    lowercaseMessage.includes("usuario nao autenticado")
  ) {
    return "Faça login para continuar.";
  }

  if (
    lowercaseMessage.includes("invalid or expired token") ||
    lowercaseMessage.includes("user not found for this token")
  ) {
    return SESSION_EXPIRED_MESSAGE;
  }

  if (lowercaseMessage.includes("admin access required")) {
    return "Esta área é exclusiva da equipe administradora.";
  }

  if (lowercaseMessage.includes("invalid email or password")) {
    return "Email ou senha incorretos.";
  }

  if (
    lowercaseMessage.includes("invalid email format") ||
    lowercaseMessage.includes("formato de email invalido")
  ) {
    return "Digite um email válido.";
  }

  if (lowercaseMessage.includes("email is already in use")) {
    return "Este email já está em uso.";
  }

  if (lowercaseMessage.includes("email cannot be changed")) {
    return "O email não pode ser alterado nesta conta.";
  }

  if (lowercaseMessage.includes("username is already in use")) {
    return "Este nome de usuário já está em uso.";
  }

  if (
    lowercaseMessage.includes("cpf is already in use") ||
    lowercaseMessage.includes("este cpf ja esta cadastrado")
  ) {
    return "Este CPF já está cadastrado.";
  }

  if (
    lowercaseMessage.includes("invalid cpf") ||
    lowercaseMessage.includes("cpf must have 11 digits")
  ) {
    return "CPF inválido. Revise os dados e tente novamente.";
  }

  if (lowercaseMessage.includes("avatarurl is too large")) {
    return "A imagem enviada é maior do que o permitido. Escolha uma imagem menor.";
  }

  if (lowercaseMessage.includes("password must")) {
    return "Sua senha precisa ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.";
  }

  if (
    lowercaseMessage.includes("you can only manage your own account") ||
    lowercaseMessage.includes("you can only view your own account")
  ) {
    return "Você só pode acessar os dados da sua própria conta.";
  }

  if (
    lowercaseMessage.includes("request body must be an object") ||
    lowercaseMessage.includes("corpo da requisicao invalido")
  ) {
    return "Não conseguimos processar essa ação agora. Tente novamente.";
  }

  if (
    lowercaseMessage.includes("is required") ||
    lowercaseMessage.includes("ha campos obrigatorios nao preenchidos")
  ) {
    return "Confira os campos obrigatórios e tente novamente.";
  }

  if (lowercaseMessage.includes("category name is already in use")) {
    return "Já existe uma categoria com esse nome.";
  }

  if (lowercaseMessage.includes("platform name is already in use")) {
    return "Já existe uma plataforma com esse nome.";
  }

  if (lowercaseMessage.includes("platform slug is already in use")) {
    return "Já existe uma plataforma com esse identificador.";
  }

  if (lowercaseMessage.includes("listing already exists for this game and platform")) {
    return "Essa plataforma já está cadastrada para este jogo.";
  }

  if (lowercaseMessage.includes("game key already exists")) {
    return "Uma ou mais keys informadas já estão cadastradas.";
  }

  if (lowercaseMessage.includes("one or more keys are invalid")) {
    return "Uma ou mais keys informadas estão em formato inválido.";
  }

  if (lowercaseMessage.includes("one or more categories are invalid")) {
    return "Selecione apenas categorias válidas para continuar.";
  }

  if (lowercaseMessage.includes("you already reviewed this game")) {
    return "Você já avaliou este jogo.";
  }

  if (
    lowercaseMessage.includes("user not found") ||
    lowercaseMessage.includes("usuario nao encontrado")
  ) {
    return "Não encontramos essa conta.";
  }

  if (
    lowercaseMessage.includes("route") && lowercaseMessage.includes("not found")
  ) {
    return RESOURCE_NOT_FOUND_MESSAGE;
  }

  if (
    lowercaseMessage.startsWith("rota ") && lowercaseMessage.includes("nao encontrada")
  ) {
    return RESOURCE_NOT_FOUND_MESSAGE;
  }

  if (
    lowercaseMessage.endsWith("not found") ||
    lowercaseMessage.includes("recurso nao encontrado")
  ) {
    return RESOURCE_NOT_FOUND_MESSAGE;
  }

  return null;
}

export function translateErrorMessage(
  message: string,
  fallback: string,
  status?: number,
  code?: string,
): string {
  const normalizedMessage = normalizeErrorText(message);
  const knownMessage = getKnownMessageTranslation(normalizedMessage, status);
  const codeMessage = code ? getCodeErrorMessage(code) : null;

  if (knownMessage) {
    return knownMessage;
  }

  if (codeMessage) {
    return codeMessage;
  }

  if (!normalizedMessage) {
    return status ? getStatusErrorMessage(status) : fallback;
  }

  return normalizedMessage;
}

export function getApiErrorMessage<TError>(error: TError, fallback: string): string {
  if (isAxiosError<ApiErrorPayload | string>(error)) {
    const responseData = error.response?.data;
    const payload: ApiErrorPayload =
      typeof responseData === "string"
        ? { message: responseData }
        : (responseData ?? {});
    const rawMessage = String(
      payload.message ?? error.message ?? "",
    );
    const rawCode = String(payload.code ?? "");

    return translateErrorMessage(rawMessage, fallback, error.response?.status, rawCode);
  }

  if (error instanceof Error) {
    return translateErrorMessage(error.message, fallback);
  }

  return fallback;
}
