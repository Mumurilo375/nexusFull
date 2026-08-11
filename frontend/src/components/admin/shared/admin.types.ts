import type { PaginationMeta } from "../../../services/http";

export type Category = {
  id: number;
  name: string;
};

export type CategoryResponse = {
  name: string;
};

export type AdminPlatform = {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string | null;
  isActive?: boolean;
};

export type GameImage = {
  id: number;
  imageUrl?: string;
  sortOrder?: number;
};

export type GameResponse = {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  releaseDate: string;
  coverImageUrl: string;
  isActive?: boolean;
  categories?: Category[];
  images?: GameImage[];
};

export type GameValues = {
  title: string;
  description: string;
  longDescription: string;
  releaseDate: string;
  coverImageUrl: string;
  isActive: boolean;
  categoryIds: number[];
};

export type GalleryItem = {
  key: string;
  kind: "existing" | "file" | "url";
  imageUrl: string;
  previewUrl: string;
  id?: number;
  file?: File;
};

export type SetGameField = <Field extends keyof GameValues>(
  field: Field,
  value: GameValues[Field],
) => void;

export type AdminOfferListingOption = {
  id: number;
  price?: number | string;
  isActive?: boolean;
  game?: {
    id?: number;
    title?: string;
  };
  platform?: {
    id?: number;
    name?: string;
    slug?: string;
  };
};

export type AdminOfferListing = {
  id: number;
  price: number;
  isActive: boolean;
  game: {
    id: number;
    title?: string | null;
    coverImageUrl?: string | null;
  } | null;
  platform: {
    id: number;
    name?: string | null;
    slug?: string | null;
  } | null;
  pricing: {
    basePrice: number;
    discountPercentage: number;
    discountAmount: number;
    finalPrice: number;
    hasDiscount: boolean;
  };
};

export type AdminOfferItem = {
  id: number;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  discountPercentage: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  listingIds: number[];
  listings: AdminOfferListing[];
};

export type AdminOfferFormState = {
  name: string;
  description: string;
  coverImageUrl: string;
  bannerImageUrl: string;
  discountPercentage: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  platformId: string;
};

export type AdminOrderUser = {
  id: number;
  username?: string | null;
  email?: string | null;
  fullName?: string | null;
  cpf?: string | null;
};

export type AdminOrderSummary = {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt?: string;
  itemCount: number;
  user: AdminOrderUser | null;
};

export type AdminOrderItem = {
  id: number;
  listingId: number;
  price: number;
  createdAt?: string;
  listing: {
    id: number;
    price: number;
    isActive: boolean;
    game: {
      id: number;
      title?: string | null;
      coverImageUrl?: string | null;
    } | null;
    platform: {
      id: number;
      name?: string | null;
      slug?: string | null;
    } | null;
  } | null;
};

export type AdminOrderDetails = {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  createdAt?: string;
  paymentConfirmedAt?: string | null;
  cancelledAt?: string | null;
  user: AdminOrderUser | null;
  items: AdminOrderItem[];
};

export type AdminPriceHistoryItem = {
  id: number;
  listingId: number;
  previousPrice: number | null;
  nextPrice: number;
  createdAt?: string;
  game: {
    id: number;
    title?: string | null;
  } | null;
  platform: {
    id: number;
    name?: string | null;
    slug?: string | null;
  } | null;
  changedBy: {
    id: number;
    username?: string | null;
    email?: string | null;
  } | null;
};

export type StockSummary = {
  available: number;
  reserved: number;
  sold: number;
  total: number;
};

export type PlatformMonitorItem = {
  platform: {
    id: number;
    name: string;
    slug: string;
    iconUrl?: string | null;
    isActive?: boolean;
  };
  hasListing: boolean;
  listingId: number | null;
  price: number | null;
  isActive: boolean;
  stock: StockSummary;
};

export type GamePlatformsResponse = {
  game: {
    id: number;
    title?: string;
    coverImageUrl?: string;
  };
  platforms: PlatformMonitorItem[];
};

export type GameKey = {
  id: number;
  keyValue: string;
  status: string;
};

export type SaveKeysResponse = {
  listingId: number;
  createdCount: number;
  skippedCount: number;
  stock: StockSummary;
};

export type DeleteKeysResponse = {
  stock: StockSummary;
};

export type PlatformFormState = {
  price: string;
  originalPrice: string;
  isActive: boolean;
  newKeysText: string;
  error: string;
  success: string;
  isSaving: boolean;
  isAddingKeys: boolean;
};

export type PlatformKeysState = {
  isLoading: boolean;
  isRemoving: boolean;
  error: string;
  items: GameKey[];
  meta: PaginationMeta;
  page: number;
  selectedIds: number[];
};

export type PlatformConfirmationState =
  | { type: "priceChange"; platformId: number }
  | { type: "removeKeys"; platformId: number };
