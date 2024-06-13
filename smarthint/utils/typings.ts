import {
  ProductDetailsPage,
  ProductListingPage,
} from "../../commerce/types.ts";
export type PageType =
  | "category"
  | "search"
  | "searchWithResult"
  | "home"
  | "cart"
  | "emptyCart"
  | "checkout"
  | "notFound"
  | "product"
  | "general"
  | "Others";

export type ComplexPageType =
  | Category
  | Search
  | SearchWithResult
  | Home
  | Cart
  | EmptyCart
  | Checkout
  | NotFound
  | Product
  | General
  | Others;

export interface Category {
  /**
   * @hide true
   */
  readonly type: "category";
  page: ProductListingPage | null;
}

export interface Search {
  /**
   * @hide true
   */
  readonly type: "search";
}

export interface SearchWithResult {
  /**
   * @hide true
   */
  readonly type: "searchWithResult";
}

export interface Home {
  /**
   * @hide true
   */
  readonly type: "home";
}

export interface Cart {
  /**
   * @hide true
   */
  readonly type: "cart";
}

export interface EmptyCart {
  /**
   * @hide true
   */
  readonly type: "emptycart";
}

export interface Checkout {
  /**
   * @hide true
   */
  readonly type: "checkout";
}

export interface NotFound {
  /**
   * @hide true
   */
  readonly type: "notfound";
}

export interface Product {
  /**
   * @hide true
   */
  readonly type: "product";
  page: ProductDetailsPage | null;
}

export interface Others {
  /**
   * @hide true
   */
  readonly type: "others";
}

export interface General {
  /**
   * @hide true
   */
  readonly type: "general";
}

export interface Banner {
  Name?: string;
  UrlBanner?: string;
  UrlRedirect?: string;
  NewTab?: string;
  Sequence?: number;
  BannerHtml?: string;
}
