import {
  readQueryParams,
  validatePaginationQuery,
} from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface ListOrdersQuery {
  page: number;
  limit: number;
}

export { validatePositiveIdParam as validateOrderIdParam } from "../utils/request-validator";

export function validateListOrdersQuery(query: InputValue | null | undefined): ListOrdersQuery {
  return validatePaginationQuery(readQueryParams(query));
}
