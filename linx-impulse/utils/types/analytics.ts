export type LinxUser = {
  id: string;
  email: string;
  allowMailMarketing?: boolean;
  name?: string;
  /**
   * @description Date of birth in format YYYY-MM-DD
   */
  birthday?: string;
  gender?: "M" | "F";
};

export type LinxPage =
  | "home"
  | "category"
  | "search"
  | "subcategory"
  | "product"
  | "cart"
  | "checkout"
  | "transaction"
  | "emptysearch"
  | "landingpage"
  | "userprofile"
  | "notfound"
  | "other";

export type LinxHomePage = {
  page: "home";
};

export type LinxCheckoutPage = {
  page: "checkout";
};
export type LinxLandingPagePage = {
  page: "landingpage";
};

export type LinxUserProfilePage = {
  page: "userprofile";
};

export type LinxNotFoundPage = {
  page: "notfound";
};

export type LinxOtherPage = {
  page: "other";
};

type Category = {
  id: string;
  name: string;
  parents: string[];
};

export type LinxCategoryPage = {
  page: "category";
  searchId?: string;
  categories: string[] | Category[];
};

export type LinxSubcategoryPage = Omit<LinxCategoryPage, "page"> & {
  page: "subcategory";
};

export type LinxProduct = {
  pid: string;
  sku?: string;
  price?: number;
};

export type LinxProductPage = LinxProduct & {
  page: "product";
};

export type LinxSearchPage = {
  page: "search" | "emptysearch";
  query: string;
  items: LinxProduct[];
  searchId?: string;
};

export type LinxCartItem = LinxProduct & {
  quantity: number;
};

export type LinxCartPage = {
  page: "cart";
  items: LinxCartItem[];
  id: string;
};

export type LinxTransactionPage = {
  page: "transaction";
  items: LinxProduct[];
  id: string;
};

export type LinxMeta =
  & (
    | LinxHomePage
    | LinxCategoryPage
    | LinxSubcategoryPage
    | LinxProductPage
    | LinxSearchPage
    | LinxCartPage
    | LinxTransactionPage
    | LinxCheckoutPage
    | LinxLandingPagePage
    | LinxUserProfilePage
    | LinxNotFoundPage
    | LinxOtherPage
  )
  & {
    /**
     * @description Indicates the current user's shopping channel. This field should only be filled if the store uses purchase channels.
     */
    salesChannel?: string;
    user?: LinxUser;
  };

export type SearchItem = {
  pid: string;
  sku?: string;
};
