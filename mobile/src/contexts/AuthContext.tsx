import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { AuthContext, type AuthContextValue } from "./auth-context";
import {
  clearAuth,
  getAuthSnapshot,
  getToken,
  saveAuth,
  type AuthUser,
} from "../services/auth";
import { setUnauthorizedHandler } from "../services/api";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isReady: boolean;
};

const initialState: AuthState = { token: null, user: null, isReady: false };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(initialState);

  useEffect(() => {
    let isMounted = true;

    void getAuthSnapshot()
      .then(({ token, user }) => {
        if (isMounted) setAuth({ token, user, isReady: true });
      })
      .catch(() => {
        if (isMounted) setAuth({ ...initialState, isReady: true });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setAuth({ token: null, user: null, isReady: true });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await logout();
      router.replace("/login");
    });

    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token && auth.user),
      isAdmin: Boolean(auth.user?.isAdmin || auth.user?.is_admin),
      isReady: auth.isReady,
      login: async (token, user) => {
        await saveAuth(token, user);
        setAuth({ token, user, isReady: true });
      },
      logout,
      syncUser: async (user) => {
        const token = await getToken();
        if (!token) return;
        await saveAuth(token, user);
        setAuth({ token, user, isReady: true });
      },
    }),
    [auth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
