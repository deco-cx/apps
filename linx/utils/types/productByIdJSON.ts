import { LinxInstallment } from "./installments.ts";
import {
  CategoryItem,
  LinxMetadata,
  SellerInfo,
  SortOption,
  Spell,
} from "./shared.ts";

export interface ProductByIdResponse {
  HasPreviousPage: boolean;
  HasNextPage: boolean;
  PageFirst: number;
  PageLast: number;
  PageNumber: number;
  PageIndex: number;
  PageCount: number;
  PageSize: number;
  ProductCount: number;
  HasProducts: boolean;
  ProviderCapabilities: ProviderCapabilities;
  Products: Product[];
  SortOptions: SortOption[];
  Facets: unknown[];
  Terms: unknown[];
  Spell: Spell;
  Query: string;
}

export interface ProviderCapabilities {
  Provider: string;
  CanSort: boolean;
  CanFacet: boolean;
  CanPage: boolean;
  CanTerm: boolean;
  CanSpell: boolean;
}

export interface Product {
  BrowsingImage: BrowsingImage;
  BrowsingImages: BrowsingImage[];
  Price: Price;
  JoinCollection: unknown;
  Items: Item[];
  HasPickup: boolean;
  ShortDescription: string;
  Condition: string;
  DisplayCondition: boolean;
  Url: string;
  ClickUrl: unknown;
  PageTitle: string;
  MetaDescription: string;
  MetaKeywords: string;
  IsFreeShipping: boolean;
  Uom: string;
  IsUponRequest: boolean;
  IsUndeliverable: boolean;
  IsGiftCertificate: boolean;
  IntegrationID: string;
  PurchasingFormID: number;
  CurrentSellerID: number;
  IsNew: boolean;
  NewFrom: string;
  NewTo: string;
  VisibleFrom: string;
  VisibleTo: unknown;
  BrandID: number;
  BrandName: string;
  BrandUrl: string;
  BrandImageUrl: string;
  RootCategoryUrl: string;
  RootCategoryName: string;
  LeafCategoryUrl: string;
  LeafCategoryName: string;
  LeafCategoryId: number;
  CategoryItems: CategoryItem[];
  IsPurchasable: boolean;
  AllowOnlyAdditionalPurchase: boolean;
  ProductDefinitionID: number;
  IsInventoryAvailable: boolean;
  Availability: string;
  AvailabilityText: string;
  ReplenishmentStatus: string;
  DisplayStockQuantity: boolean;
  StockBalance: string;
  StockOnHand: string;
  OutOfStockFrom: unknown;
  OutOfStockTo: unknown;
  Preorderable: boolean;
  PreorderDate: string;
  Backorderable: boolean;
  EstimatedReorderDate: unknown;
  HasEstimatedReorderDate: boolean;
  ListPrice: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom: unknown;
  PromotionTo: null;
  RetailPrice: number;
  Tax: number;
  TaxationAmount: number;
  RetailPriceMax: number;
  RetailPriceMin: number;
  PriceDescription: string;
  DisplayPrice: string;
  PromotionOnlyCheckout: boolean;
  Flags: unknown[];
  Tags: unknown[];
  Medias: Media[];
  MediaGroups: MediaGroup[];
  MediaSmall: string;
  RatingAverage: number;
  RatingCount: number;
  ReviewCount: number;
  Options: Option[];
  PropertyPath: string;
  CurrentSkuID: number;
  HasCurrentSkuID: boolean;
  Descriptions: LinxMetadata[];
  MininumOfDistinctSKUs: number;
  MininumOfSKUsQuantity: number;
  QuantityReturned: unknown;
  ProductSelection: ProductSelection;
  UrlHelper: unknown;
  ProductID: number;
  SKU: string;
  Name: string;
  ProductTypeID: number;
  CatalogItemTypeID: number;
  CatalogItemBehavior: string;
  ExtendedMetadatas: LinxMetadata[];
  LoyaltyProgramPoints: unknown[];
  ProductDefinition: unknown;
}

export interface BrowsingImage {
  MaxWidth: number;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: string;
  MediaPath: string;
  VariationPath: string;
  ProductPath: string;
  MediaType: string;
  Index: number;
  Title: string | null;
  Url: string | null;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface Price {
  MaxInstallmentsWithInterest: unknown;
  MaxInstallmentsNoInterest: LinxInstallment;
  BestInstallment: LinxInstallment | null;
  BestInstallmentCreditCard: unknown;
  ItemAddFreeItem: unknown;
  HasMunknownSkus: boolean;
  ListPrice: number;
  SalesPrice: number;
  Tax: number;
  ListPriceWithTax: number;
  HasSalesPrice: boolean;
  SalesPriceWithTax: number;
  SalesPriceDiscount: number;
  SalesPriceWithTaxDiscount: number;
  TaxationAmount: number;
  HasBuyBox: boolean;
  BuyBox: SellerInfo;
  CurrentPaymentTerm: unknown;
  IsNullPrice: boolean;
}

export interface Item {
  Items: Item[];
  VariationPath: string;
  VariationLevel: number;
  ProductPath: string;
  ProductLevel: number;
  MinimumQtyAllowed: number;
  MaximumQtyAllowed: number;
  Weight: number;
  Height: number;
  Width: number;
  Depth: number;
  Order: number;
  UrlFriendly: string;
  IsBundleItemRequired: boolean;
  BundleQuantity: number;
  BundleAdjustType: string;
  BundleAdjustValue: number;
  BundleGroup: null;
  BundleType: string;
  BundlePriceType: string;
  BundleKitDiscount: string;
  BundleKitDiscountValue: number;
  ComposeMinPrice: boolean;
  PriceDescription: string | null;
  ListPrice: number;
  RetailPrice: number;
  Tax: number;
  TaxationAmount: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom: string | null;
  PromotionTo: null;
  StockBalance: number;
  InStockHandlingDays: number;
  OutOfStockHandlingDays: number;
  HandlingDays: number;
  Availability: string;
  AvailabilityText: string;
  ReplenishmentStatus: string;
  IsPurchasable: boolean;
  IsInventoryAvailable: boolean;
  Preorderable: boolean;
  PreorderDate: string;
  Backorderable: boolean;
  BackorderLimit: null;
  OutOfStockFrom: null;
  OutOfStockTo: null;
  UPC: string | null;
  EstimatedReorderDate: null;
  HasEstimatedReorderDate: boolean;
  Options: Option[];
  SKUOptions: Skuoption[];
  BundleHierarchyPrice: null;
  IntegrationID: string;
  Edit: null;
  BuyBox: null;
  IsDeliverable: boolean;
  UrlHelper: unknown;
  ProductID: number;
  SKU: string;
  Name: string;
  ProductTypeID: number;
  CatalogItemTypeID: number;
  CatalogItemBehavior: string;
  ExtendedMetadatas: LinxMetadata[];
  LoyaltyProgramPoints: unknown[];
  Price: null;
  ProductDefinition: null;
}

export interface Option {
  PropertyMetadataID: number;
  PropertyName: string;
  Label: string;
  IsVerificationRequired: boolean;
  HasVariationLayout: boolean;
  VariationLayoutTemplate: string;
  Values: Value[];
}

export interface Skuoption {
  PropertyMetadataID: number;
  Alias: string;
  Name: string;
  Value: string;
  Title: string;
  PropertyPath: string;
  ValueAlias: string;
  Reference: string | null;
  Color: string | null;
  ImagePath: string | null;
  Order: number;
  GroupName: null;
  GroupType: string;
}

export interface Value {
  HasItems: boolean;
  OptionID: number;
  Reference: null;
  Color: string | null;
  ImagePath: string | null;
  IsSelected: boolean;
  Text: string;
  Value: string;
  Order: number;
  PropertyPath: string;
  GroupName: null;
}

export interface Media {
  MaxWidth: number;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: string;
  MediaPath: string;
  VariationPath: string;
  ProductPath: string;
  MediaType: string;
  Index: number;
  Title: string | null;
  Url: string | null;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface MediaGroup {
  IsPurchasable: boolean;
  ProductPath: string;
  ProductLevel: number;
  VariationPath: string;
  VariationLevel: number;
  MediaType: string;
  Medias: Media[];
  Thumbnail: Thumbnail;
  Small: Small;
  Medium: Medium;
  Large: Large;
  Zoom: Zoom;
  Custom: unknown;
}

export interface Thumbnail {
  MaxWidth: number;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: string;
  MediaPath: string;
  VariationPath: string;
  ProductPath: string;
  MediaType: string;
  Index: number;
  Title: string | null;
  Url: string | null;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface Small {
  MaxWidth: number;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: string;
  MediaPath: string;
  VariationPath: string;
  ProductPath: string;
  MediaType: string;
  Index: number;
  Title: string | null;
  Url: string | null;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface Medium {
  MaxWidth: number;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: string;
  MediaPath: string;
  VariationPath: string;
  ProductPath: string;
  MediaType: string;
  Index: number;
  Title: string | null;
  Url: string | null;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface Large {
  MaxWidth: number;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: string;
  MediaPath: string;
  VariationPath: string;
  ProductPath: string;
  MediaType: string;
  Index: number;
  Title: string | null;
  Url: string | null;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface Zoom {
  MaxWidth: number;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: string;
  MediaPath: string;
  VariationPath: string;
  ProductPath: string;
  MediaType: string;
  Index: number;
  Title: string | null;
  Url: string | null;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface ProductSelection {
  PropertyPath: string;
  PropertyLevel: number;
  SkuID: number;
  Quantity: number;
}
