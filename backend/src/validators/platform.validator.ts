import { AppError } from "../utils/app-error";
import {
  requireString,
  parseOptionalText,
  parseBooleanInput,
  readQueryParams,
  readRequestBody,
  validatePaginationQuery,
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

export { validatePositiveIdParam as validateIdParam } from "../utils/request-validator";
