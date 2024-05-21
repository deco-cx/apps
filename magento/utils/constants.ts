import { FiltersGraphQL } from "./clientGraphql/types.ts";
export const URL_KEY = "url_key";

export const IN_STOCK = "https://schema.org/InStock";
export const OUT_OF_STOCK = "https://schema.org/OutOfStock";

export const SORT_OPTIONS_ORDER = [
  "position",
  "name",
  "price",
  "best_seller",
  "top_rated",
  "created_at",
  "most_viewed",
  "review_count",
];

export const DEFAULT_GRAPHQL_FILTERS: FiltersGraphQL[] = [
  { value: "activity", type: "EQUAL" },
  { value: "category_gear", type: "EQUAL" },
  { value: "category_id", type: "EQUAL" },
  { value: "category_uid", type: "EQUAL" },
  { value: "category_url_path", type: "EQUAL" },
  { value: "climate", type: "EQUAL" },
  { value: "collar", type: "EQUAL" },
  { value: "color", type: "EQUAL" },
  { value: "description", type: "MATCH" },
  { value: "eco_collection", type: "EQUAL" },
  { value: "erin_recommends", type: "EQUAL" },
  { value: "features_bags", type: "EQUAL" },
  { value: "format", type: "EQUAL" },
  { value: "gender", type: "EQUAL" },
  { value: "material", type: "EQUAL" },
  { value: "name", type: "MATCH" },
  { value: "new", type: "EQUAL" },
  { value: "pattern", type: "EQUAL" },
  { value: "performance_fabric", type: "EQUAL" },
  { value: "price", type: "RANGE" },
  { value: "purpose", type: "EQUAL" },
  { value: "sale", type: "EQUAL" },
  { value: "short_description", type: "MATCH" },
  { value: "size", type: "EQUAL" },
  { value: "sku", type: "EQUAL" },
  { value: "sleeve", type: "EQUAL" },
  { value: "strap_bags", type: "EQUAL" },
  { value: "style_bags", type: "EQUAL" },
  { value: "style_bottom", type: "EQUAL" },
  { value: "style_general", type: "EQUAL" },
  { value: "url_key", type: "EQUAL" },
];