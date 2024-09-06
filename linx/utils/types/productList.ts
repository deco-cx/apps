import {
  BrowsingImage,
  CategoryItem,
  LinxMetadata,
  SellerInfo,
  SortOption,
  Spell,
  Tag,
} from "./shared.ts";

export interface ProductListResponse {
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

export interface Product {
  BrowsingImage: BrowsingImage;
  BrowsingImages: BrowsingImage[];
  Price: Price;
  JoinCollection: null;
  Items: Item[];
  HasPickup: boolean;
  ShortDescription: string;
  Condition: string;
  DisplayCondition: boolean;
  Url: string;
  ClickUrl: string;
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
  NewFrom: null | string;
  NewTo: null;
  VisibleFrom: string;
  VisibleTo: null;
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
  OutOfStockFrom: null;
  OutOfStockTo: null;
  Preorderable: boolean;
  PreorderDate: string;
  Backorderable: boolean;
  EstimatedReorderDate: null;
  HasEstimatedReorderDate: boolean;
  ListPrice: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom: null | string;
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
  Tags: Tag[];
  Medias: BrowsingImage[];
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
  QuantityReturned: null;
  ProductSelection: ProductSelection;
  ProductID: number;
  SKU: string;
  Name: string;
  ProductTypeID: number;
  CatalogItemTypeID: number;
  CatalogItemBehavior: string;
  ExtendedMetadatas: LinxMetadata[];
  LoyaltyProgramPoints: unknown[];
  ProductDefinition: null;
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
  PriceDescription: null | string;
  ListPrice: number;
  RetailPrice: number;
  Tax: number;
  TaxationAmount: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom: null | string;
  PromotionTo: string | null;
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
  SKUOptions: LinxMetadata[];
  BundleHierarchyPrice: null;
  IntegrationID: null | string;
  Edit: null;
  BuyBox: null;
  IsDeliverable: boolean;

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

export interface Value {
  HasItems: boolean;
  OptionID: number;
  Reference: null;
  Color: null | string;
  ImagePath: null | string;
  IsSelected: boolean;
  Text: string;
  Value: string;
  Order: number;
  PropertyPath: string;
  GroupName: null;
}

export interface MediaGroup {
  IsPurchasable: boolean;
  ProductPath: string;
  ProductLevel: number;
  VariationPath: string;
  VariationLevel: number;
  MediaType: string;
  Medias: BrowsingImage[];
  Thumbnail: BrowsingImage;
  Small: BrowsingImage;
  Medium: BrowsingImage;
  Large: BrowsingImage;
  Zoom: BrowsingImage;
  Custom: null;
}

export interface Price {
  MaxInstallmentsWithInterest: null;
  MaxInstallmentsNoInterest: MaxInstallmentsNoInterest;
  BestInstallment: null;
  BestInstallmentCreditCard: null;
  ItemAddFreeItem: null;
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
  CurrentPaymentTerm: null;
  IsNullPrice: boolean;
}

export interface MaxInstallmentsNoInterest {
  Installments: number;
  InstallmentPrice: number;
  InterestRate: number;
  YearInterestRate: number;
  RetailPrice: number;
  Discount: number;
  DiscountType: string;
  PaymentName: string;
  PaymentType: string;
}

export interface ProductSelection {
  PropertyPath: string;
  PropertyLevel: number;
  SkuID: number;
  Quantity: number;
}

export interface ProviderCapabilities {
  Provider: string;
  CanSort: boolean;
  CanFacet: boolean;
  CanPage: boolean;
  CanTerm: boolean;
  CanSpell: boolean;
}
