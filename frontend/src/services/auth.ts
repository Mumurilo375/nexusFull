export type AuthUser = {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
};

const TOKEN_KEY = "token";
const USER_KEY = "authUser";
export const AUTH_CHANGED_EVENT = "nexus:auth-changed";

function notifyAuthChange(): void {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function saveAuth(token: string, user?: AuthUser | null): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  notifyAuthChange();
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function isAdminUser(): boolean {
  return Boolean(getAuthUser()?.isAdmin);
}
