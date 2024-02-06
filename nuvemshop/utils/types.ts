import type { FnContext } from "deco/types.ts";

export interface Account {
  /**
   * @description Header to define our app. For example, https://tiendanube.github.io/api-documentation/intro#authentication.
   */
  userAgent: string;

  /**
   * @description The token generated from admin panel. Read here: https://tiendanube.github.io/api-documentation/authentication.
   */
  accessToken: string;

  /**
   * @description The id of the store in nuvemshop. Check: https://tiendanube.github.io/api-documentation/intro#languages-and-internationalization
   */
  storeId: string;
}

// https://tiendanube.github.io/api-documentation/resources/product
export interface ProductBaseNuvemShop {
  id: number;
  name: LanguageTypes;
  description: LanguageTypes;
  handle: LanguageTypes;
  variants: ProductVariant[];
  images: ProductImage[];
  categories: Category[];
  brand: string;
  published: boolean;
  free_shipping: boolean;
  video_url: string;
  seo_title: string;
  seo_description: string;
  attributes: LanguageTypes[];
  tags: string;
  created_at: Date;
  updated_at: Date;
  requires_shipping: boolean;
  canonical_url: string;
}
export interface ProductVariant {
  id: number;
  name?: string;
  image_id: string;
  product_id: number;
  price?: number;
  promotional_price?: number;
  stock_management?: boolean;
  stock?: number | null;
  weight: number;
  width: number;
  height: number;
  depth: number;
  sku: string;
  values: LanguageTypes[];
  barcode: string;
  mpn: string;
  age_group: "newborn" | "infant" | "toddler" | "kids" | "adult";
  gender: "female" | "male" | "unisex";
  cost?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductImage {
  id: number;
  product_id: number;
  src: string;
  position: number;
  created_at: Date;
  updated_at: Date;
  alt: string;
}

export interface Category {
  id: number;
  name: LanguageTypes;
  description: LanguageTypes;
  handle: string[];
  parent?: number;
  subcategories: number[];
  google_shopping_category: string;
  created_at: Date;
  updated_at: Date;
}

export type NuvemShopSort =
  | "user"
  | "price-ascending"
  | "price-descending"
  | "alpha-ascending"
  | "alpha-descending"
  | "created-at-ascending"
  | "created-at-descending"
  | "best-selling";

export interface ProductSearchParams {
  q?: string;
  page?: number;
  sort_by?: NuvemShopSort;
  per_page: number;
  price_min?: string | null;
  price_max?: string | null;
}

export interface LanguageTypes {
  pt?: string;
  en?: string;
  es?: string;
}

export interface PriceInterval {
  minPrice: string;
  maxPrice: string;
  quantity: number;
}

export type Context = FnContext<{
  configNuvemShop?: Account;
}>;

function account(acc: Account) {
  return acc;
}

export default account;

export interface UpdateCartResponse {
  success: boolean;
  cart: Cart;
  items: Item[];
  free_shipping: null;
}

export interface Cart {
  id: number;
  token: string;
  store_id: number;
  abandoned_checkout_url: string;
  contact_email: null;
  contact_name: string;
  contact_phone: null;
  contact_identification: null;
  shipping_name: string;
  shipping_phone: null;
  shipping_address: null;
  shipping_number: null;
  shipping_floor: null;
  shipping_locality: null;
  shipping_zipcode: null;
  shipping_city: null;
  shipping_province: null;
  shipping_country: null;
  shipping_min_days: null;
  shipping_max_days: null;
  billing_name: null;
  billing_phone: null;
  billing_address: null;
  billing_number: null;
  billing_floor: null;
  billing_locality: null;
  billing_zipcode: null;
  billing_city: null;
  billing_province: null;
  billing_country: null;
  shipping_cost_owner: null;
  shipping_cost_customer: null;
  coupon: unknown[];
  promotional_discount: PromotionalDiscount;
  subtotal: string;
  discount: string;
  discount_coupon: string;
  discount_gateway: string;
  total: string;
  total_usd: string;
  checkout_enabled: boolean;
  weight: string;
  currency: string;
  language: string;
  gateway: null;
  gateway_id: null;
  gateway_name: null;
  shipping: null;
  shipping_option: null;
  shipping_option_code: null;
  shipping_option_reference: null;
  shipping_pickup_details: null;
  shipping_tracking_number: null;
  shipping_tracking_url: null;
  shipping_store_branch_name: null;
  shipping_store_branch_extra: null;
  shipping_pickup_type: null;
  shipping_suboption: unknown[];
  extra: unknown;
  storefront: string;
  note: null;
  created_at: string;
  updated_at: string;
  completed_at: null;
  next_action: string;
  payment_details: PaymentDetails;
  attributes: unknown[];
  customer: null;
  contact_accepts_marketing: boolean;
  contact_accepts_marketing_updated_at: string;
  products: ProductElement[];
  subtotal_short: string;
  subtotal_long: string;
  discount_short: string;
  discount_long: string;
  discount_coupon_short: string;
  discount_coupon_long: string;
  discount_gateway_short: string;
  discount_gateway_long: string;
  total_short: string;
  total_long: string;
}

export interface PaymentDetails {
  method: null;
  credit_card_compunknown: null;
  installments: number;
}

export interface ProductElement {
  id: number;
  depth: string;
  height: string;
  name: string;
  price: string;
  compare_at_price: string;
  product_id: number;
  image: PurpleImage;
  quantity: number;
  free_shipping: boolean;
  weight: string;
  width: string;
  variant_id: number;
  variant_values: unknown[];
  properties: unknown[];
  sku: string;
  barcode: null;
  url: string;
  price_short: string;
  price_long: string;
  subtotal_short: string;
  subtotal_long: string;
}

export interface PurpleImage {
  id: number;
  product_id: number;
  src: string;
  position: number;
  alt: unknown[];
  created_at: string;
  updated_at: string;
}

export interface PromotionalDiscount {
  id: null;
  store_id: number;
  order_id: number;
  created_at: string;
  total_discount_amount: string;
  contents: unknown[];
  promotions_applied: unknown[];
}

export interface Item {
  id: number;
  name: string;
  short_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  url: string;
  sku: string;
  product: ItemProduct;
  variant_id: number;
  short_variant_name: string;
  featured_image: FeaturedImageClass;
  google_item_categories: null;
}

export interface FeaturedImageClass {
  id: number;
  image: string;
  alt: string;
  thumbnails_generated: number;
  position: number;
  dimensions: Dimensions;
}

export interface Dimensions {
  width: number;
  height: number;
  aspect_ratio: number;
}

export interface ItemProduct {
  id: number;
  name: string;
  price: number;
  compare_at_price: number;
  display_price: boolean;
  min_price: number;
  max_price: null;
  canonical_url: string;
  social_url: string;
  social_theme_url: string;
  stock: number;
  stock_control: boolean;
  weight: string;
  weight_unit: string;
  sku: string;
  brand: null;
  free_shipping: boolean;
  is_non_shippable: boolean;
  requires_shipping: boolean;
  video_url: null;
  currency: string;
  images: FeaturedImageClass[];
  images_count: number;
  featured_image: FeaturedImageClass;
  featured_variant_image: FeaturedImageClass;
  default_options: null[];
  selected_or_first_available_variant: SelectedOrFirstAvailableVariant;
  installments_info: InstallmentsInfo;
  payment_methods_config: PaymentMethodsConfig;
  max_installments_without_interest: MaxInstallments;
  max_installments: MaxInstallments;
  seo_title: string;
  handle: string;
  metafields: unknown[];
  promotional_offer: null;
  selected_variant: null;
  barcode: null;
  height: string;
  width: string;
  depth: string;
  available: boolean;
}

export interface InstallmentsInfo {
  "Nuvem Pago": { [key: string]: InstallmentData };
}

export interface InstallmentData {
  installment_value: number;
  installment_value_cents: number;
  interest: number;
  total_value: number;
  without_interests: boolean;
}

export interface MaxInstallments {
  installment: number;
  installment_data: InstallmentData;
}

export interface PaymentMethodsConfig {
  "Nuvem Pago": NuvemPago;
}

export interface NuvemPago {
  name: string;
  installments_data: { [key: string]: InstallmentData };
  show_full_installments: boolean;
  max_discount: number;
  has_general_discount: boolean;
}

export interface SelectedOrFirstAvailableVariant {
  id: number;
  name: string;
  option1: null;
  option2: null;
  option3: null;
  options: unknown[];
  price: number;
  compare_at_price: number;
  display_price: boolean;
  currency: string;
  sku: string;
  barcode: null;
  weight: string;
  weight_unit: string;
  stock: number;
  stock_control: boolean;
  available: boolean;
  canonical_url: string;
  image: FeaturedImageClass;
  metafields: unknown[];
  selected: boolean;
  height: string;
  width: string;
  depth: string;
}
