export type LibraryItem = {
  id: number;
  gameKey?: { keyValue?: string; soldAt?: string };
  listing?: {
    price?: number | string;
    game?: { title?: string; coverImageUrl?: string };
    platform?: { name?: string };
  };
  order?: { orderNumber?: string };
};
