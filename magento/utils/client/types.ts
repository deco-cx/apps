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
  value: string | string[];
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
interface MediaEntry {
  id: number;
  media_type: string;
  label: string | null;
  position: number;
  disabled: boolean;
  types: string[];
  file: string;
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
  media_gallery_entries?: MediaEntry[];
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

export interface Cart {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_virtual: boolean;
  items: MagentoProductsCart[];
  items_count: number;
  items_qty: number;
  customer: {
    email: string | null;
    firstname: string | null;
    lastname: string | null;
  };
  billing_address: {
    id: number;
    region: string | null;
    region_id: string | null;
    region_code: string | null;
    country_id: string | null;
    street: string[];
    telephone: string | null;
    postcode: string | null;
    city: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    same_as_billing: number;
    save_in_address_book: number;
  };
  orig_order_id: number;
  currency: {
    global_currency_code: string;
    base_currency_code: string;
    store_currency_code: string;
    quote_currency_code: string;
    store_to_base_rate: number;
    store_to_quote_rate: number;
    base_to_global_rate: number;
    base_to_quote_rate: number;
  };
  customer_is_guest: boolean;
  customer_note_notify: boolean;
  customer_tax_class_id: number;
  store_id: number;
  extension_attributes: {
    shipping_assignments: ShippingAssignment[];
    negotiable_quote: {
      quote_id: number | null;
      is_regular_quote: boolean | null;
      status: string | null;
      negotiated_price_type: string | null;
      negotiated_price_value: number | null;
      shipping_price: number | null;
      quote_name: string | null;
      expiration_period: string | null;
      email_notification_status: number | null;
      has_unconfirmed_changes: boolean | null;
      is_shipping_tax_changed: boolean | null;
      is_customer_price_changed: boolean | null;
      notifications: string | null;
      applied_rule_ids: string | null;
      is_address_draft: boolean | null;
      deleted_sku: string | null;
      creator_id: number | null;
      creator_type: string | null;
    };
  };
}

export interface MagentoProductsCart {
  item_id: number;
  sku: string;
  qty: number;
  name: string;
  price: number;
  product_type: string;
  quote_id: string;
}

export interface ShippingAssignment {
  shipping: {
    address: Address;
    method: string | null;
  };
  items: MagentoProductsCart[];
}

export interface Address {
  id: number;
  region: string | null;
  region_id: string | null;
  region_code: string | null;
  country_id: string | null;
  street: string[];
  telephone: string | null;
  postcode: string | null;
  city: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  same_as_billing: number;
  save_in_address_book: number;
}

export interface ShippingMethod {
  carrier_code: string;
  method_code: string;
  carrier_title: string;
  method_title: string;
  amount: number;
  base_amount: number;
  available: boolean;
  extension_attributes: Record<string, string | string[] | number>;
  error_message: string;
  price_excl_tax: number;
  price_incl_tax: number;
}

export interface CustomerAddress {
  countryId: string;
  postcode: string;
}
