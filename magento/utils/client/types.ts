export interface CategoryLink {
  position: number;
  category_id: string;
}

interface MagentoImage {
  url: string;
  code: string;
  height: number;
  width: number;
  label: string;
  resized_width: number;
  resized_height: number;
}

export interface CustomAttribute {
  attribute_code: string;
  value: string | number | string[];
}

export interface MagentoCategory {
  id: number;
  parent_id: number;
  name: string;
  is_active: boolean;
  position: number;
  level: number;
  children: string;
  created_at: string;
  updated_at: string;
  path: string;
  include_in_menu: boolean;
  custom_attributes: CustomAttribute[];
}

export interface MagentoPriceInfo {
  final_price: number;
  max_price: number;
  max_regular_price: number;
  minimal_regular_price: number;
  special_price: number | null;
  minimal_price: number;
  regular_price: number;
  formatted_prices: {
    final_price: string;
    max_price: string;
    minimal_price: string;
    max_regular_price: string;
    minimal_regular_price: string | null;
    special_price: string | null;
    regular_price: string;
  };
  extension_attributes: {
    msrp: {
      msrp_price: string;
      is_applicable: string;
      is_shown_price_on_gesture: string;
      msrp_message: string;
      explanation_message: string;
    };
    tax_adjustments: {
      final_price: number;
      max_price: number;
      max_regular_price: number;
      minimal_regular_price: number;
      special_price: number;
      minimal_price: number;
      regular_price: number;
      formatted_prices: {
        final_price: string;
        max_price: string;
        minimal_price: string;
        max_regular_price: string;
        minimal_regular_price: string | null;
        special_price: string;
        regular_price: string;
      };
    };
    weee_attributes: unknown[];
    weee_adjustment: string;
  };
}

interface MagentoStock {
  item_id: number;
  product_id: number;
  stock_id: number;
  qty?: number;
  is_in_stock?: boolean;
  is_qty_decimal?: boolean;
  show_default_notification_message?: boolean;
  use_config_min_qty?: boolean;
  min_qty?: number;
  use_config_min_sale_qty?: boolean;
  min_sale_qty?: number;
  use_config_max_sale_qty?: boolean;
  max_sale_qty?: number;
  use_config_backorders?: boolean;
  backorders?: number;
  use_config_notify_stock_qty?: boolean;
  notify_stock_qty?: number;
  use_config_qty_increments?: boolean;
  qty_increments?: number;
  use_config_enable_qty_inc?: boolean;
  enable_qty_increments?: boolean;
  use_config_manage_stock?: boolean;
  manage_stock?: boolean;
  low_stock_date?: string | null;
  is_decimal_divided?: boolean;
  stock_status_changed_auto?: number;
}

export interface MagentoProduct {
  id: number;
  sku: string;
  name: string;
  price: number;
  status: number;
  visibility: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  weight: number;
  url: string;
  extension_attributes: {
    website_ids?: number[];
    category_links: CategoryLink[];
    stock_item?: MagentoStock;
  };
  custom_attributes: CustomAttribute[];
  price_info?: MagentoPriceInfo;
  currency_code?: string;
  images?: MagentoImage[];
}

//Query params for the request
export interface Filter {
  field: string | FieldsFilter;
  value: string;
  conditionType: string;
}

export type FieldsFilter =
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

export interface ProductSearchResult {
  items: MagentoProduct[];
  search_criteria: SearchCriteria;
  total_count: number;
}
