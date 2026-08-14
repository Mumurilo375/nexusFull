import { ApiError, type ApiErrorPayload } from "./http";
import { getToken } from "./auth";

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
};

type UnauthorizedHandler = () => Promise<void> | void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

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
    if (data && typeof data === "object") return data as ApiErrorPayload;
  } catch {
    // A resposta sem JSON ainda é representada pelo status HTTP.
  }

  return undefined;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const error = new ApiError(response.status, await parseError(response));
    if (response.status === 401 && unauthorizedHandler) {
      await unauthorizedHandler();
    }
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body });
  },
};

export default api;
