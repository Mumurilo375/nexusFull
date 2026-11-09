import { timingSafeEqual } from "node:crypto";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

export function paymentServiceMiddleware(req: Request, _res: Response, next: NextFunction) {
  const secret = process.env.PAYMENTS_SERVICE_SECRET ?? "";
  const received = Buffer.from(req.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (secret.length < 32 || received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new AppError(401, "UNAUTHORIZED", "User not authenticated");
  }
  next();
}
