export type CartItem = {
  id: number;
  listingId: number;
  quantity?: number;
  isQuantityAvailable?: boolean;
  stock?: { available?: number };
  listing?: {
    id: number;
    price: number | string;
    game?: { title?: string; coverImageUrl?: string };
    platform?: { name?: string };
  };
};

export type CartResponse = {
  items: CartItem[];
};
