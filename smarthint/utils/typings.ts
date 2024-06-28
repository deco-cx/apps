import { Product, ProductDetailsPage } from "../../commerce/types.ts";
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
  | "others";

export type ComplexPageType =
  | Category
  | Search
  | SearchWithResult
  | Home
  | Cart
  | EmptyCart
  | Checkout
  | NotFound
  | ProductPageType
  | General
  | Others;

export interface Category {
  /**
   * @hide true
   */
  readonly type: "category";
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

/**
 * @title Product
 */
export interface ProductPageType {
  /**
   * @hide true
   */
  readonly type: "product";
  /**
   * @description Product page loader
   */
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

export type SearchSort = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface FilterProp {
  field: string;
  value: string;
}

export interface Hotsite {
  Name?: string;
  Url?: string;
  Active?: boolean;
  SearchResult?: SearchResult;
}

export interface SearchResult {
  Key?: string;
  Suggest?: string[];
  urlRedirect?: string;
  SearchId?: string;
  SearchTerm?: string;
  Anonymous?: string;
  Date?: string;
  SearchTime?: number;
  PosProcessTime?: number;
  TotalResult?: number;
  Products?: SHProduct[];
  Filters?: SHFilter[];
  Sorts?: SHSort[];
  IsRedirect?: boolean;
  QuantityFilterShow?: number;
  QuantityFilterOptionShow?: number;
  Success?: boolean;
  Banners?: Banner[];
  QuickFilters?: Record<string | number | symbol, unknown | never>;
  Personalized?: boolean;
  SearchAtributes?: Record<string | number | symbol, unknown | never>;
  SearchType?: number;
}

export interface Banner {
  Name?: string;
  UrlBanner?: string;
  NewTab?: string;
  UrlRedirect?: string;
  LayoutType?: number;
  Sequence?: number;
  BannerHtml?: string;
}

export interface SHFilter {
  Key?: Key;
  Value?: FilterValue[];
}

export interface Key {
  FieldSource?: string;
  Show?: string;
  Value?: string;
  Active?: boolean;
  IsAscending?: boolean;
  Sort?: number;
  MultiValue?: boolean;
  Config?: Config;
}

export interface FilterValue {
  Quantity?: number;
  Index?: number;
  Show?: string;
  Value?: string;
  Checked?: string;
  Active?: boolean;
  IsAscending?: boolean;
  Sort?: number;
  MultiValue?: boolean;
}

export interface Config {
  FilterType?: number;
  FixedRange?: number;
  BucketsNumber?: number;
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
  Config?: Config;
}

export interface RecommendationsByPage {
  RecommendationsPromotional?: RecommendationsPromotional[];
  RecommendationsCombination?: RecommendationsCombination[];
  Recommendations?: unknown[];
  SmartHintPosition?: string;
  RecommendationsProducts?: Recommendations[];
}

export interface RecommendationsCombination {
  Combos?: Combo[];
  Order?: number;
  NameRecommendation?: string;
  TitleRecommendation?: string;
  EventGoogleAnalytics?: string;
}
export interface Recommendations {
  Order?: number;
  NameRecommendation?: string;
  TitleRecommendation?: string;
  EventGoogleAnalytics?: string;
  Products?: SHProduct[];
}

export interface Combo {
  Order?: number;
  TitleCombo?: string;
  BannerUrl?: string;
  BannerUrlClick?: string;
  BannerHtml?: string;
  Products?: SHProduct[];
}

export interface SHProduct {
  Gender?: string;
  Rules?: Rule[];
  Conditions?: Condition[];
  Id?: string;
  Title?: string;
  Description?: string;
  Price?: number;
  SalePrice?: number;
  Availability?: string;
  AvailabilityPercentage?: number;
  ProductId?: string;
  ProductType?: string;
  Key?: string;
  Date?: string;
  Link?: string;
  Installment?: number;
  InstallmentAmount?: number;
  Categories?: string[];
  ImageLink?: string;
  Condition?: string;
  Brand?: string;
  Mpn?: string;
  MpnFather?: string;
  Tags?: string[];
  Sku?: string;
  SecondInstallment?: number;
  SecondInstallmentAmount?: number;
  PromotionDiscount?: number;
  AdicionalImageLink?: string[];
  BankSlipPrice?: number;
  CreatedDate?: string;
  UpdatedDate?: string;
  Offer?: boolean;
  OfferDate?: string;
  LowerPrice?: boolean;
  LowerPriceDate?: string;
  HasInterest?: boolean;
  IsBlacklisted?: boolean;
  OverlayPrice?: number;
  UponRequest?: boolean;
  ImageLinkSmall?: string;
  AdditionalTag?: string;
  SellsCount?: number;
  ViewsCount?: number;
  HasPromotion?: boolean;
  PriceInteger?: string;
  PriceDecimal?: string;
  HasSalePrice?: boolean;
  SalePriceInteger?: string;
  SalePriceDecimal?: string;
  HasBankSlipPrice?: boolean;
  BankSlipPriceInteger?: string;
  BankSlipPriceDecimal?: string;
  HasInstallment?: boolean;
  InstallmentAmountInteger?: string;
  InstallmentAmountDecimal?: string;
  HasSecondInstallment?: boolean;
  SecondInstallmentAmountInteger?: string;
  SecondInstallmentAmountDecimal?: string;
  HasAdditionalTag?: boolean;
  HasDiscount?: boolean;
  Discount?: number;
  SecondImageLink?: string;
  FirstCategory?: string;
  LastCategory?: string;
  PurchasePercentage?: number;
  FinalPrice?: number;
  BlockedRecommendation?: boolean;
  BlockedOverlay?: boolean;
  BlockedSearch?: boolean;
  BlockedHotsite?: boolean;
  Excluded?: boolean;
  ProductFilters?: unknown[];
  AditionalFeatures?: Record<string | number | symbol, unknown | never>;
  Completion?: Completion;
  CustomWeight?: number;
  Specifications?: Specification[];
  shImport?: unknown[];
  StockDate?: string;
  ReviewStars?: number;
  ReviewStarsComposite?: number;
  Timestamp?: number;
  ReleaseDateDescription?: string;
  Score?: number | null;
  ItemGroupId?: unknown | null;
  Variations?: unknown | null;
  Ncm?: unknown | null;
  Gtin?: unknown | null;
  OnlineOnly?: unknown | null;
  ProductIdToCart?: unknown | null;
  BaseLink?: unknown | null;
  ThumbnailImageLink?: unknown | null;
  CategoryForBoxName?: unknown | null;
  ProductColors?: null;
  IndexName?: string;
  isHighlightProduct?: boolean;
}

export interface Specification {
  sku?: string;
  specificationId?: string;
  mpnFather?: string;
  availability?: string;
  variations?: Variation[];
  changes?: Value[];
}

export interface Variation {
  Name?: string;
  Value?: string;
}

export interface RecommendationsPromotional {
  Order?: number;
  NameRecommendation?: string;
  TitleRecommendation?: string;
  EventGoogleAnalytics?: string;
  BannerUrl?: string;
  BannerUrlClick?: string;
  BannerHtml?: string;
  PositionBanner?: string;
  HasTimer?: boolean;
  StartDateTime?: string;
  EndDateTime?: string;
  Products?: SHProduct[];
}

export interface Condition {
  StartDouble?: number;
  EndDouble?: number;
  Validation?: string[];
  Values?: ConditionValueClass[];
  Value?: string;
}

export interface ConditionValueClass {
  Field?: string;
  Name?: string;
  ValueString?: string;
}

export interface Completion {
  Input?: string[];
}

export interface Rule {
  Value?: string;
  Values?: Value[];
  StartDouble?: number;
  EndDouble?: number;
  StartDate?: string;
  EndDate?: string;
}

export interface Value {
  Name?: string;
  ValueDouble?: number;
  ValueString?: string;
  ValueInt?: number;
}

export interface SmarthintRecommendation {
  "@type":
    | "RecommendationsProducts"
    | "RecommendationsCombination"
    | "RecommendationsPromotional"
    | "Recommendations";
  titleRecommendation?: string;
  eventGoogleAnalytics?: string;
  nameRecommendation?: string;
  products: Product[] | null;
  bannerUrl?: string;
  bannerUrlClick?: string;
  bannerHtml?: string;
  positionBanner?: string;
  hasTimer?: boolean;
  startDateTime?: string;
  endDateTime?: string;
  position?: string;
  combos?: ComboRecommendationItem[];
  order?: number;
  categories?: string;
}

export interface ComboRecommendationItem {
  order?: number;
  titleCombo?: string;
  bannerUrl?: string;
  bannerUrlClick?: string;
  bannerHtml?: string;
  products?: Product[] | null;
}
