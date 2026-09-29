import {
  readQueryParams,
  validatePaginationQuery,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListDeliveredKeysQuery {
  page: number;
  limit: number;
}

export { validatePositiveIdParam as validateDeliveredKeyIdParam } from "../utils/request-validator";

export function validateListDeliveredKeysQuery(
  query: InputValue | null | undefined,
): ListDeliveredKeysQuery {
  return validatePaginationQuery(readQueryParams(query));
}
