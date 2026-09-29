import {
  readQueryParams,
  validatePaginationQuery,
  validatePositiveIdParam,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListReviewVotesQuery {
  page: number;
  limit: number;
  reviewId?: number;
}

export { validatePositiveIdParam as validateReviewIdParam } from "../utils/request-validator";

export function validateListReviewVotesQuery(
  query: InputValue | null | undefined,
): ListReviewVotesQuery {
  const safeQuery = readQueryParams(query);
  const pagination = validatePaginationQuery(safeQuery);

  if (safeQuery.reviewId === undefined) {
    return pagination;
  }

  return {
    ...pagination,
    reviewId: validatePositiveIdParam(String(safeQuery.reviewId)),
  };
}
