export type Position = "top" | "middle" | "bottom";

export type Feature =
  | "MostPopular"
  | "Offers"
  | "New4You"
  | "Push"
  | "HistoryPersonalized"
  | "SimilarItems";

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
  references: ChaordicProduct[];
  recommendations: ChaordicProduct[];
  refreshReferenceUrl: string;
}

export interface RecommendationShelf {
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

interface Images {
  [key: string | "default"]: string;
}

interface Category {
  id: string;
  name: string;
  parents: string[];
}

interface Tag {
  id: string;
  name: string;
  parents: string[] | null;
}

interface Installment {
  count: number;
  price: number;
}

interface Details {
  [key: string]: string | number | unknown[] | Record<string, unknown>;
}

interface Specs {
  [key: string]: string | number | unknown[];
}

export interface ChaordicSku {
  name: string;
  url: string;
  images: Images;
  status: string;
  price: number;
  installment: Installment;
  oldPrice: number;
  eanCode: string;
  details: Details;
  sku: string;
  specs: Specs;
  stock: number;
  customBusicess?: Record<string, unknown>;
}

export interface ChaordicProduct {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  url: string;
  images: Images;
  brand?: string;
  installment: Installment;
  status: string;
  categories: Category[];
  tags: Tag[] | null;
  details: Record<string, string | number>;
  skus: ChaordicSku[];
  trackingUrl: string;
}
