import { AppError } from "../utils/app-error";
import { readRequestBody } from "../utils/request-validator";
import { InputValue } from "../utils/value-types";

export { validatePositiveIdParam as validateListingIdParam } from "../utils/request-validator";

export function validateCartQuantityInput(body: InputValue | null | undefined): number {
  const quantity = Number(readRequestBody(body).quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError(400, "VALIDATION_ERROR", "quantity must be a positive integer");
  }

  return quantity;
}
