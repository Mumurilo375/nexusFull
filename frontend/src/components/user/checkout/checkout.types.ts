export type CheckoutCartItem = {
  id: number;
  quantity?: number;
  isQuantityAvailable?: boolean;
  stock?: { available?: number };
  listing?: {
    price: number | string;
    game?: { title?: string };
    platform?: { name?: string };
  };
};

export type CheckoutCartResponse = {
  items: CheckoutCartItem[];
};

export type CheckoutOrderResponse = {
  id: number;
  orderNumber: string;
  totalAmount: number | string;
  status: string;
  checkoutUrl: string | null;
  paymentExpiresAt: string | null;
};

export type CheckoutCreateResponse = {
  order: CheckoutOrderResponse;
};
