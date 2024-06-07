export type PageType =
  | "category"
  | "search"
  | "searchWithResult"
  | "home"
  | "cart"
  | "emptycart"
  | "checkout"
  | "notfound"
  | "product"
  | "other";

export interface Banner {
  Name?: string;
  UrlBanner?: string;
  UrlRedirect?: string;
  NewTab?: string;
  Sequence?: number;
  BannerHtml?: string;
}
