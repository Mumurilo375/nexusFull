export type ApiErrorPayload = {
  code?: string;
  message?: string;
};

const DEFAULT_CLIENT_ERROR_MESSAGE =
  "Não conseguimos concluir essa ação agora. Tente novamente em instantes.";

function getStatusErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Algumas informações precisam ser revisadas para continuar.";
    case 401:
      return "Email ou senha incorretos.";
    case 403:
      return "Você não tem permissão para acessar esta área.";
    case 404:
      return "Não encontramos o conteúdo que você tentou acessar.";
    case 429:
      return "Muitas tentativas em sequência. Aguarde um instante e tente novamente.";
    default:
      return status >= 500
        ? "Estamos com uma instabilidade no momento. Tente novamente em instantes."
        : DEFAULT_CLIENT_ERROR_MESSAGE;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const code = error.payload?.code?.toUpperCase();
    if (code === "INVALID_CREDENTIALS") return "Email ou senha incorretos.";
    return error.payload?.message?.trim() || getStatusErrorMessage(error.status);
  }

  if (error instanceof TypeError) {
    return "Não foi possível se conectar agora. Confira sua internet e tente novamente.";
  }

  return fallback;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload?: ApiErrorPayload,
  ) {
    super(payload?.message ?? `Request failed with status code ${status}`);
  }
}
