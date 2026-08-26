import { NextFunction, Request, Response } from "express";
import { PermissionName } from "../services/rbac.service";

export function requirePermission(permission: PermissionName) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "Token not provided" });
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "Você não possui a permissão necessária para acessar este recurso",
      });
      return;
    }

    next();
  };
}
