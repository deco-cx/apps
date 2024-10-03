export type OrderBy =
  | "price"
  | "rating"
  | "popularity"
  | "date"
  | "modified"
  | "title"
  | "slug"
  | "date";

export interface BaseProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: Date;
  date_created_gmt: Date;
  date_modified: Date;
  date_modified_gmt: Date;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: null;
  date_on_sale_from_gmt: null;
  date_on_sale_to: null;
  date_on_sale_to_gmt: null;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: string[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: Dimensions;
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: string[];
  cross_sell_ids: string[];
  parent_id: number;
  purchase_note: string;
  categories: Pick<Category, "id" | "name" | "slug">[];
  tags: string[];
  images: WCImage[];
  attributes: string[];
  default_attributes: string[];
  variations: string[];
  grouped_products: unknown[];
  menu_order: number;
  meta_data: unknown[];
  _links: Links;
}

export interface Links {
  self: Collection[];
  collection: Collection[];
}

export interface Collection {
  href: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: WCImage;
  menu_order: number;
  count: number;
  _links: Links;
}

export interface Dimensions {
  length: string;
  width: string;
  height: string;
}

export interface WCImage {
  id: number;
  date_created: Date;
  date_created_gmt: Date;
  date_modified: Date;
  date_modified_gmt: Date;
  src: string;
  name: string;
  alt: string;
}
