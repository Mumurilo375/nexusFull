import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext, type AuthContextValue } from "./auth-context";
import { AUTH_CHANGED_EVENT, clearAuth, getAuthUser, getToken, saveAuth, type AuthUser } from "../services/auth";

function getAuthSnapshot() {
  return {
    token: getToken(),
    user: getAuthUser(),
  };
}

type AuthProfile = AuthUser & {
  fullName?: string;
  cpf?: string;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(getAuthSnapshot);
  const syncedProfileKey = useRef<string | null>(null);

  useEffect(() => {
    const syncAuth = () => setAuth(getAuthSnapshot());

    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    const token = auth.token;
    const userId = auth.user?.id;

    if (!token || !userId) {
      return;
    }

    const profileKey = `${token}:${userId}`;
    if (syncedProfileKey.current === profileKey) {
      return;
    }
    syncedProfileKey.current = profileKey;

    const syncProfile = async () => {
      try {
        const { default: api } = await import("../services/api");
        const { data } = await api.get<AuthProfile>(`/users/${userId}`);

        if (getToken() !== token) {
          return;
        }

        const currentUser = getAuthUser();
        if (!currentUser || currentUser.id !== userId) {
          return;
        }

        const nextUser: AuthUser = {
          id: data.id,
          email: data.email,
          username: data.username,
          avatarUrl: data.avatarUrl ?? null,
          roles: data.roles ?? [],
          permissions: data.permissions ?? [],
        };
        const sameList = (left: string[], right: string[]) =>
          left.length === right.length && left.every((value, index) => value === right[index]);
        const profileIsUnchanged =
          currentUser.id === nextUser.id &&
          currentUser.email === nextUser.email &&
          currentUser.username === nextUser.username &&
          currentUser.avatarUrl === nextUser.avatarUrl &&
          sameList(currentUser.roles, nextUser.roles) &&
          sameList(currentUser.permissions, nextUser.permissions);

        if (profileIsUnchanged) {
          return;
        }

        saveAuth(token, nextUser);
      } catch {
        // Se a sincronizacao falhar, mantemos o estado salvo atual.
      }
    };

    void syncProfile();
  }, [auth.token, auth.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      hasPermission: (permission) => Boolean(auth.user?.permissions?.includes(permission)),
      login: (token, user) => saveAuth(token, user),
      logout: () => clearAuth(),
      syncUser: (user) => {
        const token = getToken();
        if (!token) {
          return;
        }

        saveAuth(token, user);
      },
    }),
    [auth.token, auth.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
