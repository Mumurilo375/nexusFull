import { ErrorLike } from "./value-types";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  code: string,
  message: string,
): T {
  if (value == null) throw new AppError(404, code, message);
  return value;
}

export function isAppError(error: ErrorLike): error is AppError {
  return error instanceof AppError;
}
