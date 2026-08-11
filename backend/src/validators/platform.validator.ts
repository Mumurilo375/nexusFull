import { AppError } from "../utils/app-error";
import {
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreatePlatformInput {
  name: string;
  slug: string;
  iconUrl?: string | null;
}

export interface UpdatePlatformInput {
  name?: string;
  slug?: string;
  iconUrl?: string | null;
  isActive?: boolean;
}

export interface ListPlatformsQuery {
  page: number;
  limit: number;
}

function requireString(value: InputValue, field: string): string {
  const str = String(value ?? "").trim();
  if (!str) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} is required`);
  }
  return str;
}

function parseOptionalText(value: InputValue) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
}

function parseBooleanInput(value: InputValue, fieldName: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = String(value ?? "").trim().toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  throw new AppError(400, "VALIDATION_ERROR", `${fieldName} must be a boolean`);
}

export function validateCreatePlatformInput(
  body: InputValue | null | undefined,
): CreatePlatformInput {
  const requestBody = readRequestBody(body);
  const name = requireString(requestBody.name, "name");
  const slug = requireString(requestBody.slug, "slug");

  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }
  if (slug.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "slug must have at most 100 characters");
  }

  return {
    name,
    slug,
    iconUrl: parseOptionalText(requestBody.iconUrl),
  };
}

export function validateUpdatePlatformInput(
  body: InputValue | null | undefined,
): UpdatePlatformInput {
  const requestBody = readRequestBody(body);
  const result: UpdatePlatformInput = {};

  if (requestBody.name !== undefined) {
    result.name = requireString(requestBody.name, "name");
    if (result.name.length > 100) {
      throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
    }
  }

  if (requestBody.slug !== undefined) {
    result.slug = requireString(requestBody.slug, "slug");
    if (result.slug.length > 100) {
      throw new AppError(400, "VALIDATION_ERROR", "slug must have at most 100 characters");
    }
  }

  if (requestBody.iconUrl !== undefined) {
    result.iconUrl = parseOptionalText(requestBody.iconUrl);
  }

  if (requestBody.isActive !== undefined) {
    result.isActive = parseBooleanInput(requestBody.isActive, "isActive");
  }

  if (Object.keys(result).length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one field must be provided");
  }

  return result;
}

export function validateListPlatformsQuery(
  query: InputValue | null | undefined,
): ListPlatformsQuery {
  return validatePaginationQuery(readQueryParams(query));
}

export function validateIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
