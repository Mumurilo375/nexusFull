import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import Users from "../models/Users";
import { getAccessFromUser, USER_ACCESS_INCLUDE } from "../services/rbac.service";

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Token not provided" });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await Users.findByPk(payload.id, { include: USER_ACCESS_INCLUDE });

    if (!user) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "User not found for this token" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      ...getAccessFromUser(user),
    };
    next();
  } catch {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
  }
}
