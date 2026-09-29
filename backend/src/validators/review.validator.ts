import { AppError } from "../utils/app-error";
import {
  requireString,
  parseOptionalIdQuery,
  readRequestBody,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export const REVIEW_COMMENT_MAX_LENGTH = 500;

export interface CreateReviewInput {
  gameId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  rating: number;
  comment: string;
}

export interface ListReviewsQuery {
  page: number;
  limit: number;
  gameId?: number;
}

function validateComment(value: InputValue): string {
  const comment = requireString(value, "comment");
  if (comment.length > REVIEW_COMMENT_MAX_LENGTH) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `comment must have at most ${REVIEW_COMMENT_MAX_LENGTH} characters`,
    );
  }
  return comment;
}

function validateRating(value: InputValue): number {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError(400, "VALIDATION_ERROR", "rating must be an integer from 1 to 5");
  }
  return rating;
}

export { validatePositiveIdParam as validateReviewIdParam } from "../utils/request-validator";

export function validateCreateReviewInput(
  body: InputValue | null | undefined,
): CreateReviewInput {
  const requestBody = readRequestBody(body);

  return {
    gameId: validatePositiveIdParam(String(requestBody.gameId ?? "")),
    rating: validateRating(requestBody.rating),
    comment: validateComment(requestBody.comment),
  };
}

export function validateUpdateReviewInput(
  body: InputValue | null | undefined,
): UpdateReviewInput {
  const requestBody = readRequestBody(body);

  return {
    rating: validateRating(requestBody.rating),
    comment: validateComment(requestBody.comment),
  };
}

export function validateListReviewsQuery(
  query: InputValue | null | undefined,
): ListReviewsQuery {
  return parseOptionalIdQuery(query, "gameId");
}
