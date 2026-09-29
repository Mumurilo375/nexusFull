import {
  parseOptionalIdQuery,
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
  return parseOptionalIdQuery(query, "reviewId");
}
