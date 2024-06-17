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
  | "emptycart"
  | "checkout"
  | "pagenotfound"
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
  readonly type: "pagenotfound";
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

export type SearchSort = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Filter {
  field: string;
  value: string;
}

export interface SHProduct {
  ProductId?: string;
  Title?: string;
  Mpn?: string;
  MpnFather?: string;
  Sku?: string;
  Description?: string;
  Price?: number;
  HasSalePrice?: boolean;
  SalePrice?: number;
  PromotionDiscount?: number;
  Availability?: string;
  ProductType?: string;
  Link?: string;
  HasInstallment?: boolean;
  Installment?: number;
  InstallmentAmount?: number;
  HasSecondInstallment?: boolean;
  SecondInstallment?: number;
  SecondInstallmentAmount?: number;
  HasBankSlipPrice?: boolean;
  BankSlipPrice?: number;
  Gender?: string;
  Brand?: string;
  ReviewStars?: number;
  Categories?: string[];
  ImageLink?: string;
  SecondImageLink?: string;
  AdicionalImageLink?: string[];
  Tags?: string[];
  CreatedDate?: string;
  OfferDate?: string;
  ProductFilters?: {
    Key?: string;
    Show?: string;
    Visible?: boolean;
    Value?: {
      Key?: string;
      Show?: string;
    }[];
    Valeu?: {
      Key?: string;
      Show?: string;
    }[];
  }[];
  AditionalFeatures?: {
    ABC0987654321?: string;
    "0987654321ABC"?: string;
  }[];
  Rules?: {
    Value?: string;
    Values?: {
      Name?: string;
      ValueDouble?: number;
      ValueString?: string;
    }[];
    StartDouble?: number;
    EndDouble?: number;
    StartDate?: string;
    EndDate?: string;
  }[];
  Conditions?: {
    StartDouble?: number;
    EndDouble?: number;
    Validation?: string[];
    Values?: {
      Field?: string;
      Name?: string;
      ValueString?: string;
    }[];
    Value?: string;
  }[];
  Specifications?: {
    Sku?: string;
    specificationId?: string;
    availability?: string;
    Changes?: {
      Name?: string;
      ValueDouble?: number;
      ValueInt?: number;
      ValueString?: string;
    }[];
    Variations?: {
      Name?: string;
      Value?: string;
    }[];
  }[];
  SellsCount?: number;
  ViewsCount?: number;
}

export interface SHSort {
  Value?: number;
  Field?: string;
  IsAscending?: boolean;
  Show?: string;
  Checked?: string;
  Active?: boolean;
  Sort?: number;
  MultiValue?: boolean;
}

export interface SHFilter {
  Key?: {
    Show?: string;
    Value?: string;
    Active?: boolean;
    FieldSource?: string;
    IsAscending?: boolean;
    Sort?: number;
    MultiValue?: boolean;
  };
  Value?: {
    Quantity?: number;
    Index?: number;
    Show?: string;
    Value?: string;
    Checked?: string;
    Active?: boolean;
    IsAscending?: boolean;
    Sort?: number;
    MultiValue?: boolean;
  }[];
}
