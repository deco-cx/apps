// Stape API response types based on https://api.app.stape.io/api/doc

export interface Container {
  id: string;
  name: string;
  url: string;
  status: "active" | "inactive" | "pending";
  zone: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapiGateway {
  id: string;
  name: string;
  url: string;
  status: "active" | "inactive" | "pending";
  zone: string;
  plan: string;
  pixelIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StapeGateway {
  id: string;
  name: string;
  url: string;
  status: "active" | "inactive" | "pending";
  zone: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

// E-commerce event types compatible with GA4 and other platforms
export interface EcommerceEvent {
  event_name: string;
  client_id?: string;
  user_id?: string;
  timestamp_micros?: number;
  user_properties?: Record<string, unknown>;
  events: EventData[];
}

export interface EventData {
  name: string;
  params: EventParams;
}

export interface EventParams {
  // Common e-commerce parameters
  currency?: string;
  value?: number;
  transaction_id?: string;
  session_id?: string;

  // Product parameters
  item_id?: string;
  item_name?: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;

  // Enhanced e-commerce parameters
  items?: Item[];

  // Page view parameters
  page_location?: string;
  page_title?: string;
  page_referrer?: string;

  // Custom parameters
  [key: string]: unknown;
}

export interface Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_brand?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  currency?: string;
  discount?: number;
  affiliation?: string;
  coupon?: string;
  creative_name?: string;
  creative_slot?: string;
  item_list_id?: string;
  item_list_name?: string;
  location_id?: string;
  promotion_id?: string;
  promotion_name?: string;
}

// Standard e-commerce events supported by Stape
export type StandardEvents =
  | "page_view"
  | "view_item"
  | "view_item_list"
  | "select_item"
  | "add_to_wishlist"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "add_shipping_info"
  | "purchase"
  | "refund"
  | "search"
  | "select_promotion"
  | "view_promotion";

export interface StapeEventRequest {
  events: EventData[];
  client_id?: string;
  user_id?: string;
  timestamp_micros?: number;
  user_properties?: Record<string, unknown>;
  non_personalized_ads?: boolean;
  consent?: {
    ad_storage?: "granted" | "denied";
    analytics_storage?: "granted" | "denied";
    ad_user_data?: "granted" | "denied";
    ad_personalization?: "granted" | "denied";
  };
}
