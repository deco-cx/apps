import { Product } from "./linx.ts";

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
