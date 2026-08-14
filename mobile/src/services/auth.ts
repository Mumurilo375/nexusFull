import * as SecureStore from "expo-secure-store";

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
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
    typeof user.username === "string"
  );
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
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
  return { token, user };
}

export async function saveAuth(token: string, user?: AuthUser | null): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);

  if (user) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return;
  }

  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function clearAuth(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
