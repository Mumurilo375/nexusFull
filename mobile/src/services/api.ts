import { ApiError, type ApiErrorPayload } from "./http";
import { getToken } from "./auth";

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
  timeoutMs?: number;
};

type UnauthorizedHandler = () => Promise<void> | void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
const DEFAULT_TIMEOUT_MS = 15_000;

function isAbortError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "name" in error && error.name === "AbortError");
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function getBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("A API do aplicativo não foi configurada.");
  }

  if (!__DEV__ && !baseUrl.startsWith("https://")) {
    throw new Error("A API do aplicativo precisa usar HTTPS em produção.");
  }

  return baseUrl;
}

async function parseError(response: Response): Promise<ApiErrorPayload | undefined> {
  try {
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;

    const payload = data as Record<string, unknown>;
    return {
      code: typeof payload.code === "string" ? payload.code : undefined,
      message: typeof payload.message === "string" ? payload.message.slice(0, 500) : undefined,
    };
  } catch {
    // A resposta sem JSON ainda é representada pelo status HTTP.
  }

  return undefined;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!path.startsWith("/") || path.startsWith("//") || /^\/https?:/i.test(path)) {
    throw new Error("A rota da API precisa ser um caminho relativo seguro.");
  }

  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: externalSignal, ...fetchOptions } = options;
  const token = await getToken();
  const headers = new Headers(options.headers);
  const isMultipartBody = options.body instanceof FormData;
  headers.set("Accept", "application/json");

  if (options.body !== undefined && !isMultipartBody) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestBody =
    options.body === undefined
      ? undefined
      : isMultipartBody
        ? (options.body as FormData)
        : JSON.stringify(options.body);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1_000, timeoutMs));
  const abortFromCaller = () => controller.abort();
  externalSignal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
    ...fetchOptions,
    headers,
    body: requestBody,
    signal: controller.signal,
  });

    if (!response.ok) {
      const error = new ApiError(response.status, await parseError(response));
      if (response.status === 401 && unauthorizedHandler) {
        await unauthorizedHandler();
      }
      throw error;
    }

    if (response.status === 204) return undefined as T;
    const text = await response.text();
    if (!text.trim()) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError(502, { message: "A API retornou uma resposta inválida." });
    }
  } catch (error) {
    if (isAbortError(error)) throw new ApiError(408);
    throw error;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", abortFromCaller);
  }
}

const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body });
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PUT", body });
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PATCH", body });
  },
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};

export default api;
