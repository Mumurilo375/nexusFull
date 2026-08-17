import * as SecureStore from "expo-secure-store";

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  is_admin?: boolean;
  is_admin?: boolean;
};

const TOKEN_KEY = "token";
const USER_KEY = "authUser";

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
    (user.isAdmin === undefined || typeof user.isAdmin === "boolean") &&
    (user.is_admin === undefined || typeof user.is_admin === "boolean")
  );
}

export async function getToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token?.trim() || null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;

  try {
    const user: unknown = JSON.parse(raw);
    if (isAuthUser(user)) return user;
  } catch {
    // Dados locais corrompidos são removidos e a sessão é reiniciada.
  }

  await SecureStore.deleteItemAsync(USER_KEY);
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
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(TOKEN_KEY, normalizedToken);
  } catch (error) {
    await clearAuth();
    throw error;
  }
}

export async function clearAuth(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
