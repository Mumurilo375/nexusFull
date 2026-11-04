import {
  requireString,
  parseOptionalText,
  parseBooleanInput,
  readRequestBody,
  requireAtLeastOneField,
  validateMaxLength,
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

export type { PaginationQuery as ListPlatformsQuery } from "../utils/request-validator";

export function validateCreatePlatformInput(
  body: InputValue | null | undefined,
): CreatePlatformInput {
  const requestBody = readRequestBody(body);
  const name = requireString(requestBody.name, "name");
  const slug = requireString(requestBody.slug, "slug");

  return {
    name: validateMaxLength(name, "name", 100),
    slug: validateMaxLength(slug, "slug", 100),
    iconUrl: parseOptionalText(requestBody.iconUrl),
  };
}

export function validateUpdatePlatformInput(
  body: InputValue | null | undefined,
): UpdatePlatformInput {
  const requestBody = readRequestBody(body);
  const result: UpdatePlatformInput = {};

  if (requestBody.name !== undefined) {
    result.name = validateMaxLength(requireString(requestBody.name, "name"), "name", 100);
  }

  if (requestBody.slug !== undefined) {
    result.slug = validateMaxLength(requireString(requestBody.slug, "slug"), "slug", 100);
  }

  if (requestBody.iconUrl !== undefined) {
    result.iconUrl = parseOptionalText(requestBody.iconUrl);
  }

  if (requestBody.isActive !== undefined) {
    result.isActive = parseBooleanInput(requestBody.isActive, "isActive");
  }

  requireAtLeastOneField(result);

  return result;
}

export {
  parsePaginationQuery as validateListPlatformsQuery,
  validatePositiveIdParam as validateIdParam,
} from "../utils/request-validator";
