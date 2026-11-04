import { readRequestBody, requireString, validateMaxLength } from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreateCategoryInput {
  name: string;
}

export type UpdateCategoryInput = CreateCategoryInput;
export type { PaginationQuery as ListCategoriesQuery } from "../utils/request-validator";

export function validateCreateCategoryInput(
  body: InputValue | null | undefined,
): CreateCategoryInput {
  const name = requireString(readRequestBody(body).name, "name");
  return { name: validateMaxLength(name, "name", 100) };
}

export const validateUpdateCategoryInput = validateCreateCategoryInput;
export {
  parsePaginationQuery as validateListCategoriesQuery,
  validatePositiveIdParam as validateIdParam,
} from "../utils/request-validator";
