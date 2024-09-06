import {
  CategoryItem,
  LinxError,
  LinxMetadata,
  NavigationInfo,
  Path,
  ProductDefinition,
  ProductSelection,
  ResponseCallBack,
  SellerInfo,
} from "./shared.ts";

export interface WebPage {
  Response: Response;
  Model: Model;
  PageInfo: PageInfo;
  PageParameters: PageParameters;
}

export interface Model {
  BidAmountMultiplier: number;
  ExecutionFrom: Date;
  ExecutionTo: Date;
  InitialAmount: number;
  IsExecuting: boolean;
  MarketAmountMultiplier: number;
  MinimunBidAmount: number;
  Name: string;
  Navigation: NavigationInfo[];
  Product: Product;
  ProductAuctionID: number;
  ReservationAmount: number;
  VisibleFrom: Date;
  VisibleTo: Date;
}

export interface Product {
  AcceptanceTermID: number;
  AllowOnlyAdditionalPurchase: boolean;
  Associations: unknown[];
  Availability: string;
  AvailabilityText: string;
  Backorderable: boolean;
  BrandID: number;
  BrandImageUrl: null;
  BrandName: string;
  BrandUrl: string;
  CatalogItemBehavior: string;
  CatalogItemTypeID: number;
  CategoryItems: CategoryItem[];
  ClickUrl: null;
  Condition: string;
  CurrentSellerID: number;
  CurrentSkuID: number;
  Descriptions: LinxMetadata[];
  DisplayCondition: boolean;
  DisplayPrice: string;
  DisplayStockQuantity: boolean;
  Edit: null;
  EstimatedReorderDate: Date;
  ExtendedMetadatas: LinxMetadata[];
  Flags: unknown[];
  HasAnyItemDeliverable: boolean;
  HasCurrentSkuID: boolean;
  HasEstimatedReorderDate: boolean;
  HasPickup: boolean;
  IntegrationID: string;
  IsDeliverable: boolean;
  IsFreeShipping: boolean;
  IsGiftCertificate: boolean;
  IsInventoryAvailable: boolean;
  IsNew: boolean;
  IsPromotion: boolean;
  IsPurchasable: boolean;
  IsUndeliverable: boolean;
  IsUponRequest: boolean;
  Items: Item[];
  JoinCollection: null;
  LeafCategoryId: number;
  LeafCategoryName: string;
  LeafCategoryUrl: string;
  ListPrice: number;
  LoyaltyProgramPoints: unknown[];
  MaximumQtyAllowed: number;
  MediaGroups: MediaGroup[];
  Medias: Media[];
  MediaSmall: string;
  MetaDescription: string;
  MetaKeywords: string;
  MinimumQtyAllowed: number;
  MininumOfDistinctSKUs: number;
  MininumOfSKUsQuantity: number;
  MinLeadTimeDays: number;
  Name: string;
  Navigation: null;
  NewFrom: null;
  NewTo: null;
  Options: unknown[];
  OutOfStockFrom: null;
  OutOfStockTo: null;
  PageTitle: string;
  Preorderable: boolean;
  PreorderDate: Date;
  Price: Price;
  PriceDescription: string;
  ProductDefinition: ProductDefinition;
  ProductDefinitionID: number;
  ProductID: number;
  ProductSelection: ProductSelection;
  ProductTypeID: number;
  PromotionFrom: null;
  PromotionOnlyCheckout: boolean;
  PromotionPrice: number;
  PromotionTo: null;
  PropertyPath: string;
  PurchasingFormID: number;
  QuantityReturned: null;
  RatingAverage: number;
  RatingCount: number;
  ReplenishmentStatus: string;
  RetailPrice: number;
  RetailPriceMax: number;
  RetailPriceMin: number;
  ReviewCount: number;
  RootCategoryName: string;
  RootCategoryUrl: string;
  ShortDescription: string;
  SKU: string;
  StockBalance: string;
  StockOnHand: string;
  Suppliers: unknown[];
  Tags: unknown[];
  Tax: number;
  TaxationAmount: number;
  Uom: string;
  Url: string;
  UrlHelper: PageParameters;
  VisibleFrom: Date;
  VisibleTo: null;
}

export interface Item {
  Availability: string;
  AvailabilityText: string;
  Backorderable: boolean;
  BackorderLimit: null;
  BundleAdjustType: string;
  BundleAdjustValue: number;
  BundleGroup: null;
  BundleHierarchyPrice: null;
  BundleKitDiscount: string;
  BundleKitDiscountValue: number;
  BundlePriceType: string;
  BundleQuantity: number;
  BundleType: string;
  BuyBox: null;
  CatalogItemBehavior: string;
  CatalogItemTypeID: number;
  ComposeMinPrice: boolean;
  Depth: number;
  Edit: null;
  EstimatedReorderDate: Date;
  ExtendedMetadatas: LinxMetadata[];
  HandlingDays: number;
  HasEstimatedReorderDate: boolean;
  Height: number;
  InStockHandlingDays: number;
  IntegrationID: string;
  IsBundleItemRequired: boolean;
  IsDeliverable: boolean;
  IsInventoryAvailable: boolean;
  IsPromotion: boolean;
  IsPurchasable: boolean;
  Items: Item[];
  ListPrice: number;
  LoyaltyProgramPoints: unknown[];
  MaximumQtyAllowed: number;
  MinimumQtyAllowed: number;
  Name: string;
  Options: unknown[];
  Order: number;
  OutOfStockFrom: null;
  OutOfStockHandlingDays: number;
  OutOfStockTo: null;
  Preorderable: boolean;
  PreorderDate: Date;
  Price: Price | null;
  PriceDescription: string;
  ProductDefinition: null;
  ProductID: number;
  ProductLevel: number;
  ProductPath: string;
  ProductTypeID: number;
  PromotionFrom: null;
  PromotionPrice: number;
  PromotionTo: null;
  ReplenishmentStatus: string;
  RetailPrice: number;
  SKU: string;
  SKUOptions: unknown[];
  StockBalance: number;
  Tax: number;
  TaxationAmount: number;
  UPC: null | string;
  UrlFriendly: string;
  UrlHelper: PageParameters;
  VariationLevel: number;
  VariationPath: Path;
  Weight: number;
  Width: number;
}

export interface Price {
  BestInstallment: BestInstallment;
  BestInstallmentCreditCard: null;
  BuyBox: SellerInfo;
  CurrentPaymentTerm: null;
  HasBuyBox: boolean;
  HasMunknownSkus: boolean;
  HasSalesPrice: boolean;
  IsNullPrice: boolean;
  ItemAddFreeItem: null;
  ListPrice: number;
  ListPriceWithTax: number;
  MaxInstallmentsNoInterest: BestInstallment;
  MaxInstallmentsWithInterest: null;
  SalesPrice: number;
  SalesPriceDiscount: number;
  SalesPriceWithTax: number;
  SalesPriceWithTaxDiscount: number;
  Tax: number;
  TaxationAmount: number;
}

export interface BestInstallment {
  Discount: number;
  DiscountType: string;
  InstallmentPrice: number;
  Installments: number;
  InterestRate: number;
  PaymentName: string;
  PaymentType: string;
  RetailPrice: number;
  YearInterestRate: number;
}

// deno-lint-ignore no-empty-interface
export interface PageParameters {
}

export interface MediaGroup {
  Custom: null;
  IsPurchasable: boolean;
  Large: Media;
  Medias: Media[];
  MediaType: MediaType;
  Medium: Media;
  ProductLevel: number;
  ProductPath: string;
  Small: Media;
  Thumbnail: Media;
  VariationLevel: number;
  VariationPath: Path;
  Zoom: Media;
}

export interface Media {
  Attributes: unknown[];
  HasMediaPath: boolean;
  Height: number;
  Index: number;
  MaxHeight: number;
  MaxWidth: number;
  MediaPath: string;
  MediaSizeType: MediaSizeType;
  MediaType: MediaType;
  ProductPath: Path;
  Title: null;
  Url: null;
  VariationPath: Path;
  Width: number;
}

export type MediaSizeType = "Large" | "Thumbnail" | "Small" | "Medium" | "Zoom";

export type MediaType = "Image";

export interface PageInfo {
  AlternateTitle: null;
  BodyClass: string;
  CanonicalLink: string;
  CanonicalNextLink: string;
  CanonicalPrevLink: string;
  DefaultAlternateTitle: string;
  DefaultDescription: null;
  DefaultMetaDescription: string;
  DefaultMetaKeywords: string;
  DefaultPageTitle: string;
  Description: null;
  HttpStatusCode: number;
  IndexPage: boolean;
  MetaDescription: null;
  MetaKeywords: null;
  PageTitle: null;
  RouteClass: string;
  SectionClass: null;
}

export interface Response {
  Custom: PageParameters;
  Errors: LinxError[];
  IsValid: boolean;
  RefreshBasket: boolean;
  ResponseCallBack: ResponseCallBack;
  SuccessMessage: null;
  Url: null;
  Warnings: unknown[];
}
