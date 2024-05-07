export interface PDPReview {
  reviews: ProductReview[];
  composition: Composition[];
  customerSettings: CustomerSettings;
}

export interface ProductReview {
  _id: string;
  aggregateRating: number;
  recommendedPercentage: number;
  reviewCount: number;
  reviews: UserReview[];
}

export interface UserReview {
  _id: string;
  customer: string;
  sku: string;
  name: string;
  text: string;
  rating: number;
  helpful: number;
  unhelpful: number;
  verified: boolean;
  created: string;
  status: string;
  recommended: boolean;
  updated: string;
  pictures?: Picture[];
}

export interface Picture {
  _id: string;
  url: string;
}

export interface Composition {
  _id: number;
  count: number;
}

export interface CustomerSettings {
  minStarsHighlightPDP: number;
}
