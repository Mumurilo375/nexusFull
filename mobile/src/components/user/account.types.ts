export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta?: PaginationMeta;
};

export type UserLibraryItem = {
  id: number;
  gameKey?: { keyValue?: string; soldAt?: string };
  listing?: {
    price?: number | string;
    game?: { title?: string; coverImageUrl?: string };
    platform?: { name?: string; iconUrl?: string | null };
  };
  order?: { id?: number; orderNumber?: string };
};

export type UserOrderItem = {
  id: number;
  price?: number | string;
  listing?: {
    price?: number | string;
    game?: { title?: string; coverImageUrl?: string };
    platform?: { name?: string; iconUrl?: string | null };
  };
  gameKey?: { keyValue?: string; status?: string };
};

export type UserOrder = {
  id: number;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  subtotal?: number | string;
  discountAmount?: number | string;
  totalAmount?: number | string;
  createdAt?: string;
  items?: UserOrderItem[];
};

export type WishlistItem = {
  id: number;
  gameId: number;
  game?: {
    id: number;
    title?: string;
    description?: string;
    coverImageUrl?: string;
    categories?: { id: number; name: string }[];
  };
};

export type WishlistResponse = {
  items: WishlistItem[];
  total?: number;
};
