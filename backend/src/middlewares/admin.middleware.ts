import { NextFunction, Request, Response } from "express";
import Users from "../models/Users";

export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;
  console.log("Admin middleware called. UserId:", userId, "Method:", req.method, "Path:", req.path);

  if (!userId) {
    console.log("No userId found in req.user");
    res.status(401).json({ code: "UNAUTHORIZED", message: "Token not provided" });
    return;
  }

  const user = await Users.findByPk(userId);
  console.log("User found:", user?.get("email"), "isAdmin:", user?.get("isAdmin"));

  if (!user || !user.get("isAdmin")) {
    console.log("User not admin, returning 403");
    res.status(403).json({ code: "FORBIDDEN", message: "Admin access required" });
    return;
  }

  console.log("Admin check passed, calling next");
  next();
}
