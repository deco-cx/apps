export interface CategoryLink {
  position: number;
  category_id: string;
}

export interface MediaGalleryEntry {
  id: number;
  media_type: string;
  label: string | null;
  position: number;
  disabled: boolean;
  types: string[];
  file: string;
}

export interface CustomAttribute {
  attribute_code: string;
  value: string | number | string[];
}

export interface ProductMagento {
  id: number;
  sku: string;
  name: string;
  attribute_set_id: number;
  price: number;
  status: number;
  visibility: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  weight: number;
  extension_attributes: {
    website_ids: number[];
    category_links: CategoryLink[];
    subscription_options: unknown;
  };
  product_links: unknown;
  options: unknown;
  media_gallery_entries: MediaGalleryEntry[];
  tier_prices: unknown;
  custom_attributes: CustomAttribute[];
}

export interface ProductSearchResult {
  items: ProductMagento[];
  search_criteria: SearchCriteria;
  total_count: number;
}

//Query params for the request
export interface Filter {
  field: string | FieldsFilter;
  value: string;
  conditionType: string;
}

type FieldsFilter =
  | "url_key"
  | "name"
  | "price"
  | "category_id"
  | "visibility"
  | "status"
  | "type_id"
  | "created_at"
  | "updated_at"
  | "weight"
  | "extension_attributes.website_ids"
  | "extension_attributes.category_links"
  | "extension_attributes.subscription_options"
  | "product_links"
  | "options"
  | "media_gallery_entries"
  | "tier_prices"
  | "custom_attributes";

export interface FilterGroup {
  filters: Filter[];
}

export interface SortOrder {
  field: string;
  direction: string;
}

export interface SearchCriteria {
  filterGroups?: FilterGroup[];
  sortOrders?: SortOrder[];
  pageSize?: number;
  currentPage?: number;
}
