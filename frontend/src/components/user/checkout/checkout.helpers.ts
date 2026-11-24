import type { CheckoutCartItem } from "./checkout.types";

export { formatMoney as toMoney } from "../../../services/format";

export function getQuantity(item: CheckoutCartItem) {
  return Math.max(1, Number(item.quantity ?? 1));
}

export function getAvailableStock(item: CheckoutCartItem) {
  return Math.max(0, Number(item.stock?.available ?? 0));
}
