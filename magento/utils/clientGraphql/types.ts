//Leaf Elements
export interface GraphQLProductLeaf {
  canonical_url: string;
  country_of_manufacture: string;
  is_returnable?: string;
  meta_description?: string;
  meta_keyword?: string;
  meta_title?: string;
  name?: string;
  new_from_date?: string;
  new_to_date?: string;
  only_x_left_in_stock?: number;
  options_container?: string;
  rating_summary?: number;
  review_count?: number;
  sku?: string;
  special_price?: number;
  special_to_date?: number;
  staged?: boolean;
  swatch_image?: string;
  uid?: string;
  url_key?: string;
  url_suffix?: string;
}

export interface GraphQLProductQueryLeaf {
  total_count?: number;
  items?: GraphQLProductLeaf[];
  //TODO: AGGREGGATION FILTER INPUT
  aggreggations?: Aggreggation[];
  page_info?: SearchResultPageInfo;
  sort_fields?: SortFields;
  suggestions?: SearchSuggestion[];
}

export interface Aggreggation {
  attribute_code?: string;
  count?: number;
  label?: string;
  position?: number;
  options?: AggreggationOption[];
}

export interface AggreggationOption {
  count?: number;
  label?: string;
  value?: string;
}

export interface SearchResultPageInfo {
  current_page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface SortFields {
  default?: string;
  options?: SortField[];
}

export interface SortField {
  label?: string;
  value?: string;
}

export interface SearchSuggestion {
  search?: string;
}

//Querys and Returns
export interface GraphQLProductShelf {
  products: GraphQLProductQueryLeaf;
}

export interface GraphQLProductShelfInputs {
  search?: string;
  pageSize?: number;
  currentPage?: number;
  filter?: GraphQLProductFilterInput;
  sort?: GraphQLProductSortInput
}

export interface GraphQLProductFilterInput {
  activity: FilterEqualTypeInput;
  category_gear: FilterEqualTypeInput;
  category_id: FilterEqualTypeInput;
  category_uid: FilterEqualTypeInput;
  category_url_path: FilterEqualTypeInput;
  climate: FilterEqualTypeInput;
  collar: FilterEqualTypeInput;
  color: FilterEqualTypeInput;
  description: FilterMatchTypeInput;
  eco_collection: FilterEqualTypeInput;
  erin_recommends: FilterEqualTypeInput;
  features_bags: FilterEqualTypeInput;
  format: FilterEqualTypeInput;
  gender: FilterEqualTypeInput;
  material: FilterEqualTypeInput;
  name: FilterMatchTypeInput;
  new: FilterEqualTypeInput;
  pattern: FilterEqualTypeInput;
  performance_fabric: FilterEqualTypeInput;
  price: FilterRangeTypeInput;
  purpose: FilterEqualTypeInput;
  sale: FilterEqualTypeInput;
  short_description: FilterMatchTypeInput;
  size: FilterEqualTypeInput;
  sku: FilterEqualTypeInput;
  sleeve: FilterEqualTypeInput;
  strap_bags: FilterEqualTypeInput;
  style_bags: FilterEqualTypeInput;
  style_bottom: FilterEqualTypeInput;
  style_general: FilterEqualTypeInput;
  url_key: FilterEqualTypeInput;
}

export interface FilterEqualTypeInput {
  eq?: string;
  in?: string[];
}

export interface FilterMatchTypeInput {
  match?: string;
  match_type?: "FULL" | "PARTIAL";
}

export interface FilterRangeTypeInput {
  from?: string;
  to?: string;
}

export interface GraphQLProductSortInput {
  name: "ASC" | "DESC";
  position: "ASC" | "DESC";
  price: "ASC" | "DESC";
  relevance: "ASC" | "DESC";
}
