import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string | null;
  roles: string[];
  permissions: string[];
};

export const ADMIN_ACCESS_PERMISSION = "admin.access";

const TOKEN_KEY = "token";
const USER_KEY = "authUser";

function isWebStorageAvailable(): boolean {
  return Platform.OS === "web" && typeof localStorage !== "undefined";
}

async function getSessionItem(key: string): Promise<string | null> {
  if (isWebStorageAvailable()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(key);
}

async function setSessionItem(key: string, value: string): Promise<void> {
  if (isWebStorageAvailable()) {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeSessionItem(key: string): Promise<void> {
  if (isWebStorageAvailable()) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Em navegadores com armazenamento bloqueado, a sessão já é tratada como ausente.
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;

  const user = value as Partial<AuthUser>;
  return (
    typeof user.id === "number" &&
    Number.isInteger(user.id) &&
    user.id > 0 &&
    typeof user.email === "string" &&
    user.email.length <= 254 &&
    typeof user.username === "string" &&
    user.username.length <= 100 &&
    (user.avatarUrl === undefined || user.avatarUrl === null || typeof user.avatarUrl === "string") &&
    Array.isArray(user.roles) &&
    user.roles.every((role) => typeof role === "string") &&
    Array.isArray(user.permissions) &&
    user.permissions.every((permission) => typeof permission === "string")
  );
}

export async function getToken(): Promise<string | null> {
  const token = await getSessionItem(TOKEN_KEY);
  return token?.trim() || null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const raw = await getSessionItem(USER_KEY);
  if (!raw) return null;

  try {
    const user: unknown = JSON.parse(raw);
    if (isAuthUser(user)) return user;
  } catch {
    // Dados locais corrompidos são removidos e a sessão é reiniciada.
  }

  await removeSessionItem(USER_KEY);
  return null;
}

export async function getAuthSnapshot(): Promise<{
  token: string | null;
  user: AuthUser | null;
}> {
  const [token, user] = await Promise.all([getToken(), getAuthUser()]);
  if ((token && !user) || (!token && user)) {
    await clearAuth();
    return { token: null, user: null };
  }

  return { token, user };
}

export async function saveAuth(token: string, user?: AuthUser | null): Promise<void> {
  const normalizedToken = token.trim();
  if (!normalizedToken || !user || !isAuthUser(user)) {
    throw new Error("Não foi possível validar a sessão recebida.");
  }

  try {
    await setSessionItem(USER_KEY, JSON.stringify(user));
    await setSessionItem(TOKEN_KEY, normalizedToken);
  } catch (error) {
    await clearAuth();
    throw error;
  }
}

export async function clearAuth(): Promise<void> {
  await Promise.all([
    removeSessionItem(TOKEN_KEY),
    removeSessionItem(USER_KEY),
  ]);
}
