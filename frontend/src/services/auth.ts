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
    const user = JSON.parse(raw) as Partial<AuthUser>;
    if (
      typeof user.id === "number" &&
      typeof user.email === "string" &&
      typeof user.username === "string" &&
      Array.isArray(user.roles) &&
      user.roles.every((role) => typeof role === "string") &&
      Array.isArray(user.permissions) &&
      user.permissions.every((permission) => typeof permission === "string")
    ) {
      return user as AuthUser;
    }
  } catch {
    // A sessão legada ou corrompida será descartada abaixo.
  }

  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  return null;
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

export function hasPermission(permission: string, user = getAuthUser()): boolean {
  return Boolean(user?.permissions?.includes(permission));
}
