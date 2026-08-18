type CartListener = () => void;

const listeners = new Set<CartListener>();

export function subscribeToCartChanges(listener: CartListener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function notifyCartChanged() {
  listeners.forEach((listener) => listener());
}
