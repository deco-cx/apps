//Leaf Elements
export interface GraphQLProductLeaf {
  canonical_url: string;
  categories?: Array<Omit<GraphQLCategoryLeaf, "products">>;
  country_of_manufacture?: string;
  created_at?: string;
  description?: {
    html: string;
  };
  gift_message_available?: string;
  image?: ProductImage;
  is_returnable?: string;
  media_gallery?: Array<ProductImage>;
  meta_description?: string;
  meta_keyword?: string;
  meta_title?: string;
  name?: string;
  new_from_date?: string;
  new_to_date?: string;
  only_x_left_in_stock?: number;
  options_container?: string;
  price_range?: PriceRange;
  rating_summary?: number;
  review_count?: number;
  sku?: string;
  small_image?: ProductImage;
  staged?: boolean;
  stock_status?: "IN_STOCK" | "OUT_OF_STOCK";
  swatch_image?: string;
  thumbnail?: ProductImage;
  uid?: string;
  url_key?: string;
  url_rewrites?: Array<UrlRewrite>
}

export interface GraphQLProductQueryLeaf {
  total_count?: number;
  items?: GraphQLProductLeaf[];
  //TODO@aka-sacci-ccr): AGGREGGATION FILTER INPUT
  aggreggations?: Aggreggation[];
  page_info?: SearchResultPageInfo;
  sort_fields?: SortFields;
  suggestions?: SearchSuggestion[];
}

export interface GraphQLCategoryLeaf {
  automatic_sorting?: string;
  available_sort_by?: Array<string>;
  breadcrumbs?: Array<Breadcrumb>;
  canonical_url?: string;
  display_mode?: string;
  id?: string;
  include_in_menu?: string;
  is_anchor?: string;
  uid?: string;
  path_in_store?: string;
  product_count?: number;
  products?: CategoryProducts;
  staged?: boolean;
  url_key?: string;
  url_path?: string;
  url_suffix?: string;
}

export interface CategoryProducts {
  total_count?: number;
  page_info?: SearchResultPageInfo;
  items?: Array<Omit<GraphQLProductLeaf, "category">>;
}

export interface Breadcrumb {
  category_id?: number;
  category_level?: number;
  category_name?: string;
  category_uid?: number;
  category_url_key?: string;
  category_url_path?: string;
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

export interface ProductImage {
  disabled?: boolean;
  label?: string;
  position?: number;
  url?: string;
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

export interface PriceRange {
  maximum_price?: ProductPrice;
  minimum_price?: ProductPrice;
}

export interface ProductPrice {
  discount?: ProductDiscount;
  final_price?: Money;
  regular_price?: Money;
}

export interface ProductDiscount {
  amount_off?: number;
  percent_off?: number;
}

export interface Money {
  currency: "BRL";
  value: number;
}

export interface UrlRewrite {
  parameters?: Array<UrlRewrite>;
  url?: string;
}

export interface HttpQueryParameter {
  name?: string;
  value?: string;
}

//Inputs and Returns
export interface GraphQLProductShelf {
  //TODO(@aka-sacci-ccr): Pick so nos itens necessários
  products: GraphQLProductQueryLeaf;
}

export interface GraphQLProductShelfInputs {
  search?: string;
  pageSize?: number;
  currentPage?: number;
  filter?: GraphQLProductFilterInput;
  sort?: GraphQLProductSortInput;
}

export interface GraphQLProductFilterInput {
  tipo_de_pele?: FilterEqualTypeInput;
  tipo_de_pelo?: FilterEqualTypeInput;
  category_id?: FilterEqualTypeInput;
  category_uid?: FilterEqualTypeInput;
  familia_olfativa?: FilterEqualTypeInput;
  fragancias?: FilterEqualTypeInput;
  linha?: FilterEqualTypeInput;
  marca?: FilterEqualTypeInput;
  sku?: FilterEqualTypeInput;
  url_key?: FilterEqualTypeInput;
  volume?: FilterEqualTypeInput;
  name?: FilterMatchTypeInput;
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
  name?: "ASC" | "DESC";
  position?: "ASC" | "DESC";
  price?: "ASC" | "DESC";
  relevance?: "ASC" | "DESC";
}
