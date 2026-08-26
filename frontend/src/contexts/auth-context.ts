import { createContext } from "react";
import type { AuthUser } from "../services/auth";

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  syncUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
