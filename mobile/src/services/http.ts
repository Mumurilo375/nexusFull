export type ApiErrorPayload = {
  code?: string;
  message?: string;
};

type ApiErrorLike = { status: number; payload?: ApiErrorPayload };

const DEFAULT_CLIENT_ERROR_MESSAGE =
  "Não conseguimos concluir essa ação agora. Tente novamente em instantes.";

function isGenericRequestErrorMessage(message: string): boolean {
  return message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes("ocorreu um erro na solicitacao");
}

function getStatusErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Algumas informações não foram aceitas. Revise os campos preenchidos e tente novamente.";
    case 401:
      return "Email ou senha incorretos.";
    case 403:
      return "Você não tem permissão para acessar esta área.";
    case 404:
      return "Não encontramos o conteúdo que você tentou acessar.";
    case 408:
      return "A conexão demorou mais do que o esperado. Confira sua internet e tente novamente.";
    case 429:
      return "Muitas tentativas em sequência. Aguarde um instante e tente novamente.";
    default:
      return status >= 500
        ? "Estamos com uma instabilidade no momento. Tente novamente em instantes."
        : DEFAULT_CLIENT_ERROR_MESSAGE;
  }
}

function asApiError(error: unknown): ApiErrorLike | null {
  if (!error || typeof error !== "object" || !("status" in error)) return null;
  return typeof error.status === "number" ? error as ApiErrorLike : null;
}

function getErrorText(error: unknown): string {
  return error && typeof error === "object" && "message" in error && typeof error.message === "string"
    ? error.message.trim()
    : "";
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = asApiError(error);
  if (apiError) {
    const code = apiError.payload?.code?.toUpperCase();
    if (code === "INVALID_CREDENTIALS") return "Email ou senha incorretos.";
    if (code === "REVIEW_ALREADY_EXISTS") return "Você já avaliou este jogo. Edite ou exclua sua avaliação atual.";
    const message = apiError.payload?.message?.trim();
    if (message && !isGenericRequestErrorMessage(message)) return message.slice(0, 500);
    return getStatusErrorMessage(apiError.status);
  }

  if (/network|failed to fetch|socket|connection|conexão/i.test(getErrorText(error))) {
    return "Não foi possível se conectar agora. Confira sua internet e tente novamente.";
  }

  return fallback;
}

export function getImageUploadErrorMessage(error: unknown, fallback: string): string {
  const apiError = asApiError(error);
  if (apiError) {
    const code = apiError.payload?.code?.toUpperCase();
    if (apiError.status === 408) return "O envio demorou mais que o esperado. Tente novamente.";
    if (apiError.status === 413 || code === "PAYLOAD_TOO_LARGE") return "A imagem ultrapassa o limite de 5 MB. Escolha uma imagem menor.";
    if (apiError.status === 401) return "Sua sessão expirou. Entre novamente para enviar a imagem.";
    if (apiError.status === 403) return "Você não tem permissão para enviar esta imagem.";
    if (apiError.status === 404) return "Não foi possível encontrar o destino do envio. Atualize a tela e tente novamente.";
    if (apiError.status === 415) return "Use uma imagem JPG, PNG ou WEBP.";
    if (apiError.status >= 500) return "O servidor não conseguiu processar a imagem. Tente novamente em instantes.";
    return getApiErrorMessage(error, fallback);
  }

  const message = getErrorText(error);
  if (/network|failed to fetch|socket|connection|conexão/i.test(message)) {
    return "O celular não conseguiu se conectar ao servidor. Confira a rede e tente novamente.";
  }
  if (/abort|timeout|timed out|tempo.*esgotado/i.test(message)) {
    return "O envio demorou mais que o esperado e foi interrompido. Tente novamente.";
  }
  if (/unsupported formdatapart implementation/i.test(message)) {
    return "O aplicativo não conseguiu anexar a imagem da galeria. Atualize o Expo Go e tente novamente.";
  }
  if (/\b(?:file|arquivo|uri|blob|stream)\b|formdata|multipart/i.test(message)) {
    return "O aplicativo não conseguiu ler a imagem selecionada. Escolha o arquivo novamente na galeria.";
  }

  return "Falha de comunicação: o aplicativo não recebeu resposta da API. Verifique se o servidor está acessível pelo celular e tente novamente.";
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload?: ApiErrorPayload,
  ) {
    super(payload?.message ?? `Request failed with status code ${status}`);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
