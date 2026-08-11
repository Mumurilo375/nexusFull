import type { LucideIcon } from "lucide-react";

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
};

export type CheckoutCreateResponse = {
  order: CheckoutOrderResponse;
};

export type PaymentMethod = "card" | "paypal" | "pix";

export type CardField = "number" | "name" | "expiry" | "cvv" | null;

export type PaymentOptionProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
};
