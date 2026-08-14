import { createContext } from "react";
import type { AuthUser } from "../services/auth";

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isReady: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  syncUser: (user: AuthUser) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
