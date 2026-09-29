import { AppError } from "../utils/app-error";
import {
  requireString,
  parseOptionalIdQuery,
  requireAtLeastOneField,
  readRequestBody,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreateGameImageInput {
  gameId: number;
  imageUrl: string;
  sortOrder?: number;
}

export interface UpdateGameImageInput {
  imageUrl?: string;
  sortOrder?: number;
}

export interface ListGameImagesQuery {
  page: number;
  limit: number;
  gameId?: number;
}

export { validatePositiveIdParam as validateGameImageIdParam } from "../utils/request-validator";

export function validateCreateGameImageInput(
  body: InputValue | null | undefined,
): CreateGameImageInput {
  const requestBody = readRequestBody(body);
  const sortOrderValue = requestBody.sortOrder;
  const sortOrder = sortOrderValue === undefined ? 0 : Number(sortOrderValue);

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AppError(400, "VALIDATION_ERROR", "sortOrder must be a positive integer");
  }

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    imageUrl: requireString(requestBody.imageUrl, "imageUrl"),
    sortOrder,
  };
}

export function validateUpdateGameImageInput(
  body: InputValue | null | undefined,
): UpdateGameImageInput {
  const requestBody = readRequestBody(body);
  const result: UpdateGameImageInput = {};

  if (requestBody.imageUrl !== undefined) {
    result.imageUrl = requireString(requestBody.imageUrl, "imageUrl");
  }

  if (requestBody.sortOrder !== undefined) {
    const sortOrder = Number(requestBody.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new AppError(400, "VALIDATION_ERROR", "sortOrder must be a positive integer");
    }
    result.sortOrder = sortOrder;
  }

  requireAtLeastOneField(result);

  return result;
}

export function validateListGameImagesQuery(
  query: InputValue | null | undefined,
): ListGameImagesQuery {
  return parseOptionalIdQuery(query, "gameId");
}
