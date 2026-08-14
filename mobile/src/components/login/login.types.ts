import type { AuthUser } from "../../services/auth";

export type LoginResponse = {
  token: string;
  user: AuthUser;
};
