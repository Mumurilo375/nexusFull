export interface JwtPayload {
  id: number;
  email: string;
}

export interface AuthenticatedUser extends JwtPayload {
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
