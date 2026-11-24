import { timingSafeEqual } from "node:crypto";
import { RequestHandler } from "express";

function safeEquals(actual: string, expected: string) {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export const cronMiddleware: RequestHandler = (request, response, next) => {
  const secret = process.env.CRON_SECRET ?? "";
  if (secret.length < 32) {
    response.sendStatus(503);
    return;
  }

  if (!safeEquals(request.get("authorization") ?? "", `Bearer ${secret}`)) {
    response.sendStatus(401);
    return;
  }

  next();
};
