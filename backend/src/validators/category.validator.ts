import { AppError } from "../utils/app-error";
import { readRequestBody } from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export interface CreateCategoryInput {
  name: string;
}

export type UpdateCategoryInput = CreateCategoryInput;
export type { PaginationQuery as ListCategoriesQuery } from "../utils/request-validator";

function readCategoryName(body: InputValue | null | undefined) {
  const name = String(readRequestBody(body).name ?? "").trim();

  if (!name) {
    throw new AppError(400, "VALIDATION_ERROR", "name is required");
  }

  if (name.length > 100) {
    throw new AppError(400, "VALIDATION_ERROR", "name must have at most 100 characters");
  }

  return name;
}

export function validateCreateCategoryInput(
  body: InputValue | null | undefined,
): CreateCategoryInput {
  return { name: readCategoryName(body) };
}

export const validateUpdateCategoryInput = validateCreateCategoryInput;
export {
  parsePaginationQuery as validateListCategoriesQuery,
  validatePositiveIdParam as validateIdParam,
} from "../utils/request-validator";
