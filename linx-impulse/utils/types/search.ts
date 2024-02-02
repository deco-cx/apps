import type { Banner, Filter, Product, Sort } from "./linx.ts";

export type SortBy =
  | "relevance"
  | "pid"
  | "ascPrice"
  | "descPrice"
  | "ascSold"
  | "descSold"
  | "ascReview"
  | "descReview"
  | "descDiscount";

export type InteractionType = "PRODUCT_VIEW" | "ADD_TO_CART";

export interface Query {
  query: string;
  link: string;
  category?: string;
  categoryId?: string;
}

export interface AutocompleteResponse {
  requestId: string;
  searchId: string;
  queries: Query[];
  products: Product[];
}

export interface NavigateResponse {
  requestId: string;
  searchId: string;
  size: number;
  pagination: {
    first?: string;
    last?: string;
    next?: string;
  };
  filters: Filter[];
  products: Product[];
  sort: Sort[];
}

export interface SearchResponse {
  requestId: string;
  searchId: string;
  size: number;
  queries: {
    original: string;
    normalized: string;
    processed: string;
    queryType: string;
  };
  pagination: {
    first?: string;
    last?: string;
    next?: string;
  };
  filters: Filter[];
  products: Product[];
  sort: Sort[];
}

export interface HotsiteResponse {
  requestId: string;
  searchId: string;
  size: number;
  hotsite: {
    title: string;
    description: string;
    sortRule: string;
  };
  queries: {
    original: string;
    normalized: string;
    processed: string;
    queryType: string;
  };
  pagination: {
    first?: string;
    last?: string;
    next?: string;
  };
  banners: Banner[];
  filters: Filter[];
  products: Product[];
}
