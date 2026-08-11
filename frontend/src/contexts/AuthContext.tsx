import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../services/api";
import { AuthContext, type AuthContextValue } from "./auth-context";
import {
  AUTH_CHANGED_EVENT,
  clearAuth,
  getAuthUser,
  getToken,
  saveAuth,
  type AuthUser,
} from "../services/auth";

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
    if (!auth.token || !auth.user?.id) {
      return;
    }

    const syncProfile = async () => {
      try {
        const { data } = await api.get<AuthProfile>(`/users/${auth.user?.id}`);

        saveAuth(auth.token as string, {
          id: data.id,
          email: data.email,
          username: data.username,
          avatarUrl: data.avatarUrl ?? null,
          isAdmin: Boolean(data.isAdmin),
        });
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
      isAdmin: Boolean(auth.user?.isAdmin),
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
