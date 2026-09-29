import { AppError } from "./app-error";
import { InputObject, InputValue } from "./value-types";

export interface PaginationQuery {
  page: number;
  limit: number;
}

export function isInputObject(value: InputValue | null | undefined): value is InputObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readRequestBody(body: InputValue | null | undefined): InputObject {
  if (!isInputObject(body)) {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  return body;
}

export function readQueryParams(query: InputValue | null | undefined): InputObject {
  return isInputObject(query) ? query : {};
}

export function readStrictQueryParams(query: InputValue | null | undefined): InputObject {
  if (query === undefined) {
    return {};
  }

  if (!isInputObject(query)) {
    throw new AppError(400, "VALIDATION_ERROR", "Query params must be an object");
  }

  return query;
}

export function validatePaginationQuery(query: InputObject): PaginationQuery {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 20;

  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 && limit <= 100 ? limit : 20,
  };
}

export function parsePaginationQuery(query: InputValue | null | undefined): PaginationQuery {
  return validatePaginationQuery(readQueryParams(query));
}

export function parseOptionalIdQuery(
  query: InputValue | null | undefined,
  field: string,
): PaginationQuery {
  const params = readQueryParams(query);
  const pagination = validatePaginationQuery(params);
  return params[field] === undefined
    ? pagination
    : { ...pagination, [field]: validatePositiveIdParam(String(params[field])) };
}

export function validatePositiveIdParam(id: string): number {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "id must be a positive integer");
  }

  return numericId;
}

export function requireString(value: InputValue, field: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return text;
}

export function parseOptionalText(value: InputValue): string | null {
  if (value === undefined || value === null) return null;
  return String(value).trim() || null;
}

export function parseBooleanInput(value: InputValue, field: string): boolean {
  if (typeof value === "boolean") return value;

  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;

  throw new AppError(400, "VALIDATION_ERROR", `${field} must be a boolean`);
}
