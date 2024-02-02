import type { Product } from "../types/linx.ts";

export type PageName =
  | "home"
  | "product"
  | "category"
  | "subcategory"
  | "cart"
  | "confirmation"
  | "userprofile"
  | "not_found"
  | "search"
  | "landing_page"
  | "other";

export type UserIdType = "userId" | "email";

interface RecommendationDisplay {
  references: Product[];
  recommendations: Product[];
  refreshReferenceUrl: string;
}

interface RecommendationShelf {
  id: string;
  title: string;
  name: string;
  feature: string;
  impressionUrl: string;
  displays: RecommendationDisplay[];
}

export interface RecommendationsResponse {
  top: RecommendationShelf[];
  middle: RecommendationShelf[];
  bottom: RecommendationShelf[];
}
