export type OfferListing = {
  id: number;
  price?: number;
  isActive?: boolean;
  game: {
    id: number;
    title?: string | null;
    coverImageUrl?: string | null;
  } | null;
  platform: {
    id: number;
    name?: string | null;
  } | null;
  pricing: {
    basePrice: number;
    finalPrice: number;
  };
  stock?: {
    sold?: number;
  };
};

export type OfferItem = {
  id: number;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  discountPercentage: number;
  isActive: boolean;
  listings: OfferListing[];
};
