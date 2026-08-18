type NamedItem = { id: number; name: string };

export type Category = NamedItem;
export type Tag = NamedItem;

export type GameSummary = {
  id: number;
  title: string;
  description?: string;
  coverImageUrl?: string;
  price?: number;
  categories?: Category[];
  platforms?: string[];
};

export type GameImage = { id: number; imageUrl?: string; sortOrder?: number };
export type Platform = {
  id: number;
  name?: string;
  slug?: string;
  iconUrl?: string | null;
  isActive?: boolean;
};
export type ListingStock = {
  available?: number;
  reserved?: number;
  sold?: number;
  total?: number;
};
export type ListingPricing = {
  basePrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
  finalPrice?: number;
  hasDiscount?: boolean;
};
export type Promotion = {
  id: number;
  name?: string;
  description?: string | null;
  discountPercentage?: number;
};
export type ListingItem = {
  id: number;
  gameId?: number;
  platformId?: number;
  isActive?: boolean;
  price?: number | string;
  stock?: ListingStock;
  pricing?: ListingPricing;
  activePromotions?: Promotion[];
  game?: { id?: number; title?: string; coverImageUrl?: string };
  platform?: Platform;
};

export type ListingMap = Map<number, ListingItem[]>;
export type GamesResponse = { items: GameSummary[] };
export type ListingsResponse = { items: ListingItem[] };
export type PaginatedResponse<T> = { items: T[]; meta?: Record<string, unknown> };
export type WishlistResponse = { items: { gameId: number }[] };
export type CartResponse = {
  items: { listingId: number; quantity?: number; listing?: ListingItem }[];
  meta?: { subtotal?: number; totalItems?: number };
};
export type CartFeedback = {
  gameId: number;
  message: string;
  tone: "error" | "info" | "success";
};

export type GameDetails = {
  id: number;
  title?: string;
  description?: string;
  longDescription?: string;
  releaseDate?: string;
  coverImageUrl?: string;
  categories?: Category[];
  tags?: Tag[];
  images?: GameImage[];
  platformListings?: ListingItem[];
  reviewStats?: { totalReviews?: number; averageRating?: number };
};

export type ReviewVote = { id: number; userId?: number; user?: { id?: number } };
export type ReviewItem = {
  id: number;
  rating?: number;
  comment?: string;
  createdAt?: string;
  user?: { id?: number; username?: string; avatarUrl?: string | null };
  votes?: ReviewVote[];
};
export type ReviewsResponse = { items: ReviewItem[] };
export type OfferItem = {
  id: number;
  name?: string;
  description?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  isActive?: boolean;
  discountPercentage?: number;
  listings: ListingItem[];
};
