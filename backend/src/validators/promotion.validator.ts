import { AppError } from "../utils/app-error";
import {
  requireString,
  parseOptionalText,
  parseBooleanInput,
  readQueryParams,
  readRequestBody,
  requireAtLeastOneField,
  validatePaginationQuery,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreatePromotionInput {
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdatePromotionInput {
  name?: string;
  description?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface ListPromotionsQuery {
  page: number;
  limit: number;
  activeNow?: boolean;
}

function validatePercentage(value: InputValue): number {
  const discount = Number(value);
  if (!Number.isInteger(discount) || discount < 1 || discount > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "discountPercentage must be between 1 and 100");
  }
  return discount;
}

function validateDate(value: InputValue, field: string): string {
  const date = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) {
    throw new AppError(400, "VALIDATION_ERROR", `${field} must be a valid date string`);
  }
  return date;
}

export { validatePositiveIdParam as validatePromotionIdParam } from "../utils/request-validator";

export function validateCreatePromotionInput(
  body: InputValue | null | undefined,
): CreatePromotionInput {
  const requestBody = readRequestBody(body);

  return {
    name: requireString(requestBody.name, "name"),
    description: parseOptionalText(requestBody.description),
    coverImageUrl: parseOptionalText(requestBody.coverImageUrl),
    bannerImageUrl: parseOptionalText(requestBody.bannerImageUrl),
    discountPercentage: validatePercentage(requestBody.discountPercentage),
    startDate: validateDate(requestBody.startDate, "startDate"),
    endDate: validateDate(requestBody.endDate, "endDate"),
    isActive:
      requestBody.isActive === undefined
        ? true
        : parseBooleanInput(requestBody.isActive, "isActive"),
  };
}

export function validateUpdatePromotionInput(
  body: InputValue | null | undefined,
): UpdatePromotionInput {
  const requestBody = readRequestBody(body);
  const result: UpdatePromotionInput = {};

  if (requestBody.name !== undefined) result.name = requireString(requestBody.name, "name");
  if (requestBody.description !== undefined) result.description = parseOptionalText(requestBody.description);
  if (requestBody.coverImageUrl !== undefined) result.coverImageUrl = parseOptionalText(requestBody.coverImageUrl);
  if (requestBody.bannerImageUrl !== undefined) {
    result.bannerImageUrl = parseOptionalText(requestBody.bannerImageUrl);
  }
  if (requestBody.discountPercentage !== undefined) {
    result.discountPercentage = validatePercentage(requestBody.discountPercentage);
  }
  if (requestBody.startDate !== undefined) result.startDate = validateDate(requestBody.startDate, "startDate");
  if (requestBody.endDate !== undefined) result.endDate = validateDate(requestBody.endDate, "endDate");
  if (requestBody.isActive !== undefined) result.isActive = parseBooleanInput(requestBody.isActive, "isActive");

  requireAtLeastOneField(result);

  return result;
}

export function validateListPromotionsQuery(
  query: InputValue | null | undefined,
): ListPromotionsQuery {
  const safeQuery = readQueryParams(query);

  return {
    ...validatePaginationQuery(safeQuery),
    activeNow:
      safeQuery.activeNow === undefined
        ? undefined
        : parseBooleanInput(safeQuery.activeNow, "activeNow"),
  };
}
