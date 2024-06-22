//Leaf Elements
export interface ProductLeafGraphQL {
  canonical_url?: string;
  categories?: Array<Omit<CategoryLeafGraphQL, "products">>;
  country_of_manufacture?: string;
  created_at?: string;
  description?: string;
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
  __typename?: string;
  uid?: string;
  updated_at?: string;
  url_key?: string;
  url_rewrites?: Array<UrlRewrite>;
}

export interface CategoryLeafGraphQL {
  automatic_sorting?: string;
  available_sort_by?: Array<string>;
  breadcrumbs?: Array<Breadcrumb> | null;
  canonical_url?: string;
  description?: string;
  display_mode?: string;
  id?: string;
  include_in_menu?: string;
  is_anchor?: string;
  image?: string | null;
  uid?: string;
  path_in_store?: string;
  product_count?: number;
  products?: CategoryProducts;
  staged?: boolean;
  url_key?: string;
  url_path?: string;
  url_suffix?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  name?: string;
  position?: number;
}

export interface CategoryProducts {
  total_count?: number;
  page_info?: SearchResultPageInfo;
  items?: Array<Omit<ProductLeafGraphQL, "category">>;
}

export interface Breadcrumb {
  category_id?: number;
  category_level?: number;
  category_name?: string;
  category_uid?: number;
  category_url_key?: string;
  category_url_path?: string;
}

export interface Aggregation {
  attribute_code?: string;
  count?: number;
  label?: string;
  position?: number | null;
  options?: AggregationOption[];
}

export interface AggregationOption {
  count: number;
  label: string;
  value: string;
}

export interface ProductImage {
  disabled: boolean;
  label: string;
  position: number;
  url: string;
}

export interface SearchResultPageInfo {
  current_page: number;
  page_size: number;
  total_pages: number;
}

export interface SortFields {
  default?: string;
  options: SortField[];
}

export interface SortField {
  label: string;
  value: string;
}

export interface SearchSuggestion {
  search?: string;
}

export interface PriceRange {
  maximum_price: ProductPrice;
  minimum_price: ProductPrice;
}

export interface ProductPrice {
  discount: ProductDiscount;
  final_price: Money;
  regular_price: Money;
}

export interface ProductDiscount {
  amount_off: number;
  percent_off: number;
}

export interface Money {
  currency: "BRL";
  value: number;
}

export interface UrlRewrite {
  parameters?: Array<UrlRewrite>;
  url?: string;
}

//Returns
export type SimpleProductGraphQL =
  & Required<
    Pick<
      ProductLeafGraphQL,
      | "sku"
      | "url_key"
      | "uid"
      | "media_gallery"
      | "stock_status"
      | "canonical_url"
      | "name"
      | "only_x_left_in_stock"
    >
  >
  & Pick<ProductLeafGraphQL, "price_range">;

export type CompleteProductGraphQL =
  & SimpleProductGraphQL
  & Pick<
    ProductLeafGraphQL,
    | "image"
    | "small_image"
    | "thumbnail"
    | "swatch_image"
    | "description"
    | "country_of_manufacture"
    | "created_at"
    | "gift_message_available"
    | "is_returnable"
    | "options_container"
    | "staged"
    | "stock_status"
    | "__typename"
    | "updated_at"
    | "meta_title"
    | "meta_keyword"
    | "meta_description"
  >
  & {
    categories?: Array<
      Pick<CategoryLeafGraphQL, "name" | "url_key" | "position">
    >;
  };
export type SimpleCategoryGraphQL = Required<
  Pick<
    CategoryLeafGraphQL,
    | "uid"
    | "breadcrumbs"
    | "image"
    | "meta_title"
    | "meta_description"
    | "name"
    | "description"
  >
>;

export type ProductWithImages = Pick<
  ProductLeafGraphQL,
  "media_gallery" | "name" | "sku" | "url_key"
>;

export interface ProductShelfGraphQL {
  products: {
    items: SimpleProductGraphQL[];
  };
}

export interface ProductDetailsGraphQL {
  products: {
    items: CompleteProductGraphQL[];
  };
}

export interface ProductWithImagesGraphQL {
  products: {
    items: ProductWithImages[];
  };
}

export interface CategoryGraphQL {
  categories: {
    items: SimpleCategoryGraphQL[];
  };
}

export interface PLPGraphQL {
  products: {
    items: SimpleProductGraphQL[];
    page_info: SearchResultPageInfo;
    sort_fields: SortFields;
    aggregations: Array<Required<Aggregation>>;
    total_count: number;
  };
}

//Inputs - To query
export interface ProductSearchInputs {
  search?: string;
  pageSize?: number;
  currentPage?: number;
  filter?: ProductFilterInput;
  sort?: ProductSortInput;
}

export interface ProductDetailsInputs {
  filter: {
    sku: {
      eq: string;
    };
  };
}

export interface ProductImagesInputs {
  filter: {
    sku: {
      in: Array<string>;
    };
  };
  pageSize?: number;
}

export interface ProductFilterInput {
  [key: string]:
    | FilterEqualTypeInput
    | FilterMatchTypeInput
    | FilterRangeTypeInput;
}

export interface FilterEqualTypeInput {
  in?: string[];
}

export interface FilterMatchTypeInput {
  match: string;
}

export interface FilterRangeTypeInput {
  from: string;
  to: string;
}

export interface ProductSortInput {
  [key: string]: "ASC" | "DESC";
}

export interface DefaultProductSortOption {
  value: "name" | "position" | "price" | "relevance";
}

export interface CustomProductSortOption {
  value: string;
}

// Shared Loader Props
export interface ProductSort {
  /** @title Order by */
  sortBy: DefaultProductSortOption | CustomProductSortOption;
  /** @title Sequency */
  order: "ASC" | "DESC";
}

export interface FilterProps {
  name: string;
  type: FilterEqualTypeInput | FilterMatchTypeInput | FilterRangeTypeInput;
}

export interface CustomFields {
  /**
   * @description Search for global custom fields defined in App settings
   * @default false
   */
  active: boolean;
  /** @description Will override global custom fields defined in App settings */
  overrideList?: string[];
}
