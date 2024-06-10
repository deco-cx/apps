import { ProductDetailsPage } from "../../commerce/types.ts";
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
   * @default category
   */
  type?: "category";
}

export interface Search {
  /**
   * @default search
   */
  type?: "search";
}

export interface SearchWithResult {
  /**
   * @default searchWithResult
   */
  type?: "searchWithResult";
}

export interface Home {
  /**
   * @default home
   */
  type?: "home";
}

export interface Cart {
  /**
   * @default cart
   */
  type?: "cart";
}

export interface EmptyCart {
  /**
   * @default emptycart
   */
  type?: "emptycart";
}

export interface Checkout {
  /**
   * @default checkout
   */
  type?: "checkout";
}

export interface NotFound {
  /**
   * @default notfound
   */
  type?: "notfound";
}

export interface Product {
  /**
   * @default product
   */
  type?: "product";
  page: ProductDetailsPage | null;
}

export interface Others {
  /**
   * @default other
   */
  type?: "others";
}

export interface General {
  /**
   * @default general
   */
  type?: "general";
}

export interface Banner {
  Name?: string;
  UrlBanner?: string;
  UrlRedirect?: string;
  NewTab?: string;
  Sequence?: number;
  BannerHtml?: string;
}
