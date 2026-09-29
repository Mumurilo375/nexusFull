import {
  readQueryParams,
  validatePaginationQuery,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListOrderItemsQuery {
  page: number;
  limit: number;
}

export { validatePositiveIdParam as validateOrderItemIdParam } from "../utils/request-validator";

export function validateListOrderItemsQuery(
  query: InputValue | null | undefined,
): ListOrderItemsQuery {
  return validatePaginationQuery(readQueryParams(query));
}
