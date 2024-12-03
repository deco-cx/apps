import { CategoryItem, LinxError, LinxMetadata, Path } from "./shared.ts";

export interface CartResponse {
  Shopper: Shopper;
  StateChanged: boolean;
  IsValid: boolean;
  Errors: LinxError[];
}

export interface Shopper {
  Basket: Basket;
  ShopperTicket: ShopperTicket;
}

export interface Basket {
  BasketAuthorityToken: string;
  BasketID: number;
  Items: DeliveryDiscountItem[];
  DeliveryGroups: DeliveryGroup[];
  DeliveryTotal: DeliveryTotal;
  SplitDeliveryGroups: unknown[];
  SingleDeliveryOption: boolean;
  SelectedDeliveryOption: SelectedDeliveryOption;
  SelectedDeliveryOptionList: SelectedDeliveryOption[];
  PostalCode: string;
  PostalCodeAddress: string;
  IsPostalCodeReadonly: boolean;
  Awards: Award[];
  ItemAwards: unknown[];
  Discounts: unknown[];
  Upsells: unknown[];
  PaymentTerms: unknown[];
  Payments: unknown[];
  CreditCompetence: CreditCompetence;
  ItemDiscounts: Discount[];
  DeliveryDiscounts: Discount[];
  GiftCertificates: unknown[];
  Coupons: { Code: string }[];
  DeliveryAmount: number;
  DeliveryDiscountAmount: number;
  DeliveryLoyaltyProgramPoints: null;
  DiscountAmount: number;
  TotalWithoutDiscounts: number;
  SubTotal: number;
  Total: number;
  IsFreeShipping: boolean;
  TaxAmount: number;
  TaxationAmount: number;
  LoyaltyCardsList: unknown[];
  LoyaltyCardAmount: number;
  LoyaltyCardPaymentAmount: number;
  MinETADays: number;
  MaxETADays: number;
  DeliveryETADays: number;
  HasAnyAvailableWrapping: boolean;
  HasAnyAdditionalService: boolean;
  HasAnyWishlist: boolean;
  HasAnyCustomization: boolean;
  HasLoyaltyProgram: boolean;
  Wishlist: null;
  ProductAdditionals: ProductAdditional[];
  ProductAdditionalServices: unknown[];
  IsValid: boolean;
  HasAnyOutOfStockItem: boolean;
  HasPartiallyAnyOutOfStockItem: boolean;
  HasAnyUndeliverableItem: boolean;
  Sellers: unknown[];
  HasSeller: boolean;
  LoyaltyProgramTotalOfProductPoints: number;
  LoyaltyProgramMode: string;
  HasAllUndeliverableItems: boolean;
  IsReadOnly: boolean;
  OrderTypeID: number;
  HasCompetenceDiscount: boolean;
  Quote: null;
  BasketHash: string;
  ExternalDiscounts: unknown;
  Pos: null;
  OpenPosModal: boolean;
}

export interface Award {
  PromotionID: number;
  Amount: number;
  Message: string;
  BasketAwardType: string;
  RangeType: null;
  FreeItemDataSource: unknown[];
  MustRequireFreeItemSelection: boolean;
  MustSelectFreeItemWhenAvailable: boolean;
}

export interface CreditCompetence {
  Reference: null;
  Amount: number;
  ClaimedAmount: number;
  AvailableAmount: number;
}

export interface DeliveryDiscountItem {
  BasketItemID: number;
  Quantity: number;
  BasketPrice: number;
  SubTotal: number;
  Nested: unknown[];
  HasNestedServices: boolean;
  Additionals: unknown[];
  IsFreeShipping: boolean;
  IsPreviousItem: boolean;
  IsMergedItem: boolean;
  Discounts: Discount[];
  Awards: unknown[];
  Customizations: Customization[];
  HasCustomization: boolean;
  IsWishlistItem: boolean;
  Wishlist: Wishlist;
  BasketItemValidation: BasketItemValidation;
  ListPrice: number;
  RetailPrice: number;
  HasPromotion: boolean;
  Tax: number;
  TaxationAmount: number;
  ProductID: number;
  SkuID: number;
  ProductPath: string;
  VariationPath: Path;
  Name: string;
  ProductTypeID: number;
  CatalogItemType: number;
  SkuName: string;
  SKU: string;
  SkuOptions: unknown[];
  HasSkuOptions: boolean;
  UrlFriendly: string;
  ImagePath: string;
  CategoryName: string;
  SubCategoryName: string;
  BrandName: string;
  PaymentTermID: number;
  BundleAdjustType: string;
  BundleAdjustValue: number;
  BundleType: string;
  BundlePriceType: string;
  BundleKitDiscount: string;
  BundleKitDiscountValue: number;
  SpecialType: string;
  ProductAdditionalID: number;
  ProductAdditionalIndex: number;
  ProductAuctionID: number;
  IsEditableItem: boolean;
  IsRemovableItem: boolean;
  Seller: Seller;
  ProductItem: Item;
  SkuItem: Item;
  Priority: number;
  DirectProductID: number;
  LoyaltyProgramPoints: number;
  HasLoyaltyProgram: boolean;
  GiftCertificateProductData: GiftCertificateProductData;
  CustomerRelation: CustomerRelation;
  Product: Product;
  Warehouses: number[];
  DeliveryGroupKey: null;
  IsDeliverable: boolean;
  PurchasingFormData: unknown[];
}

export interface Discount {
  Reference: string;
  Amount: number;
  Message: string;
  CouponCode: string;
  Type: string;
  ProductID: number;
  PromotionID: number;
  ExternalItemsIdentifier: null;
  ExternalPromotionName: null;
  Item?: DeliveryDiscountItem;
}

export interface BasketItemValidation {
  IsValid: boolean;
  RequiredQuantity: number;
  SimilarDestinationUrl: null;
  Status: null;
}

export interface CustomerRelation {
  CustomerID: number;
  AddressID: number;
  Name: null;
  TradingName: null;
}

export interface Customization {
  PropertyMetadataID: number;
  PropertyName: string;
  InputType: string;
  DisplayName: string;
  IsRequired: boolean;
  ValidationRule: null;
  MaxLength: number;
  Value: string;
  IsSelected: boolean;
  Hint: null;
  Options: unknown[];
}

export interface GiftCertificateProductData {
  Email: null;
  Name: null;
  Message: null;
}

export interface Product {
  BrowsingImage: BrowsingImage;
  BrowsingImages: BrowsingImage[];
  Price: null;
  JoinCollection: null;
  Items: ProductItem[];
  HasPickup: boolean;
  ShortDescription: string;
  Condition: string;
  DisplayCondition: boolean;
  Url: string;
  ClickUrl: null;
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
  NewFrom: null;
  NewTo: null;
  VisibleFrom: Date;
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
  PreorderDate: Date;
  Backorderable: boolean;
  EstimatedReorderDate: Date;
  HasEstimatedReorderDate: boolean;
  ListPrice: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom: null;
  PromotionTo: null;
  RetailPrice: number;
  Tax: number;
  TaxationAmount: number;
  RetailPriceMax: number;
  RetailPriceMin: number;
  PriceDescription: null;
  DisplayPrice: string;
  PromotionOnlyCheckout: boolean;
  Flags: Flag[];
  Tags: unknown[];
  Medias: BrowsingImage[];
  MediaGroups: MediaGroup[];
  MediaSmall: string;
  RatingAverage: number;
  RatingCount: number;
  ReviewCount: number;
  Options: unknown[];
  PropertyPath: string;
  CurrentSkuID: number;
  HasCurrentSkuID: boolean;
  Descriptions: LinxMetadata[];
  MininumOfDistinctSKUs: number;
  MininumOfSKUsQuantity: number;
  QuantityReturned: null;
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
  ProductDefinition: null;
}

export interface BrowsingImage {
  MaxWidth: number;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: MediaSizeType;
  MediaPath: string;
  VariationPath: Path;
  ProductPath: Path;
  MediaType: MediaType;
  Index: number;
  Title: null;
  Url: null;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export type MediaSizeType = "Small" | "Thumbnail" | "Medium" | "Large" | "Zoom";

export type MediaType = "Image";

export type GroupType = "Description" | "Extended";

export interface Flag {
  FlagID: number;
  Alias: string;
  Label: string;
  ImagePath: string;
}

export interface ProductItem {
  Items: ProductItem[];
  VariationPath: Path;
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
  PriceDescription: null;
  ListPrice: number;
  RetailPrice: number;
  Tax: number;
  TaxationAmount: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom: null;
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
  PreorderDate: Date;
  Backorderable: boolean;
  BackorderLimit: null;
  OutOfStockFrom: null;
  OutOfStockTo: null;
  UPC: null | string;
  EstimatedReorderDate: Date;
  HasEstimatedReorderDate: boolean;
  Options: unknown[];
  SKUOptions: unknown[];
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

export interface MediaGroup {
  IsPurchasable: boolean;
  ProductPath: string;
  ProductLevel: number;
  VariationPath: Path;
  VariationLevel: number;
  MediaType: MediaType;
  Medias: BrowsingImage[];
  Thumbnail: BrowsingImage;
  Small: BrowsingImage;
  Medium: BrowsingImage;
  Large: BrowsingImage;
  Zoom: BrowsingImage;
  Custom: null;
}

export interface ProductSelection {
  PropertyPath: Path;
  PropertyLevel: number;
  SkuID: number;
  Quantity: number;
}

export interface Item {
  ExtendedMetadatas: unknown[];
  Descriptions: unknown[];
}

export interface Seller {
  SellerID: null;
  HasSeller: boolean;
  SellerName: null;
  ETA: number;
  DeliveryAmount: number;
  HasDeliveryOptions: boolean;
  HasLimits: boolean;
  PurchaseLimit: PurchaseLimit;
}

export interface PurchaseLimit {
  SalesSubTotalLimit: null;
  SalesUnitLimit: null;
  SalesSubTotalMaximum: null;
  SalesUnitLimitMaximum: null;
  Evaluation: null;
}

export interface Wishlist {
  WishlistID: number;
  Hash: string;
  Name: null;
  UrlFriendly: null;
  WishlistDefinitionID: number;
  WishlistDefinitionName: null;
  Url: string;
  AvailableQuantity: number;
  DeliveryAddressID: null;
}

export interface DeliveryGroup {
  SplitGroupName: null;
  SplittingKey: number;
  DeliveryGroupID: number;
  Name: string;
  Alias: string;
  Description: string;
  ShowLogo: boolean;
  Type: string;
  GroupBidStrategy: string;
  ListOrderStrategy: string;
  DeliveryOptions: DeliveryOption[];
  SellerID: number;
  DockID: number;
  WarehouseID: number;
  GroupKey: null;
  GroupSkus: unknown[];
}

export interface DeliveryOption {
  DeliveryOptionID: string;
  DeliveryMethodID: string;
  DeliveryMethodType: string;
  DeliveryOptionType: null;
  Name: string;
  Description: null;
  Alias: string;
  Amount: number;
  OriginalAmount: number;
  DiscountAmount: number;
  Logo: string;
  EstimatedTime: string;
  EstimatedUnit: string;
  OriginalEstimatedUnit: string;
  ETA: string;
  OriginalETA: string;
  OnlyShipToStore: boolean;
  DeliveryEstimatedDate: null;
  IsPointOfSaleDelivery: boolean;
  IsPickupLocker: boolean;
  IsOMSPickupLocker: boolean;
  IsDockWithdrawalPoint: boolean;
  Schedule: null;
  PointOfSales: unknown[];
  ExtendedProperties: unknown[];
  OnlyPickUpAllItems: boolean;
  HasDifferentLocations: boolean;
  ShouldLimitState: boolean;
  ItemsETAs: null;
  HasOMSAppliedRules: boolean;
  MoreExpensiveOrSamePrice: boolean;
  LongerOrSameETA: boolean;
  ETADifferenceDays: number;
  TotalDeliveryDays: number;
  DeliveryGatewayMethodName: string;
}

export interface DeliveryTotal {
  IsMarketPlacleEnableAndViewTypeList: boolean;
  AmountTotal: number;
  ETAHighest: null;
  ETATotalSeconds: number;
  EstimatedUnit: null;
}

export interface ProductAdditional {
  ProductAdditionalID: number;
  Name: string;
  IsRequired: boolean;
  IsMultipleChoice: boolean;
  Flow: string;
  Type: string;
  ConsiderInterest: boolean;
}

export interface SelectedDeliveryOption {
  DeliveryMethodID: string;
  Name: string;
  Amount: number;
  AmountWithoutDiscount: number;
  ETA: string;
  OriginalETA: string;
  BasketID: number;
  DeliveryGroupID: number;
  DeliveryGroupName: string;
  DeliveryOptionID: string;
  IsDockWithdrawalPoint: boolean;
  IsPickupLocker: boolean;
  IsOMSPickupLocker: boolean;
  IsPointOfSaleDelivery: boolean;
  ScheduleDisplayName: null;
  ScheduleTax: null;
  ScheduleStartTime: null;
  ScheduleEndTime: null;
  ScheduleShiftExternalID: null;
  ScheduleShiftID: null;
  ScheduleDate: null;
  Alias: string;
  Logo: string;
  DiscountAmount: number;
  Discounts: SelectedDeliveryOptionDiscount[];
  EstimatedTime: string;
  EstimatedUnit: string;
  OriginalEstimatedUnit: string;
  DeliveryMethodType: string;
  WarehouseID: number;
  LocationID: null;
  Location: null;
  ExtendedProperties: unknown[];
  DeliveryOptionType: null;
  GroupKey: null;
  HasDifferentLocations: boolean;
  ShouldLimitState: boolean;
  ItemsETAs: null;
  HasOMSAppliedRules: boolean;
  MoreExpensiveOrSamePrice: boolean;
  LongerOrSameETA: boolean;
  OriginalAmount: number;
  ETADifferenceDays: number;
  TotalDeliveryDays: number;
  DeliveryGatewayMethodName: string;
}

export interface SelectedDeliveryOptionDiscount {
  ProductID: null;
  PromotionID: null;
  Amount: number;
  CouponCode: string;
}

export interface ShopperTicket {
  ShopperTicketID: string;
  WebSiteID: number;
  CustomerID: number;
  CommingFromUrl: null;
  UtmSource: null;
  UtmMedium: null;
  UtmCampaign: null;
  UtmTerm: null;
  UtmContent: null;
  LastTicketID: string;
  CreatedDate: Date;
  TrafficSourceID: null;
  BasketID: number;
  CustomerGroupIDs: null;
  IsAuthenticated: boolean;
  Name: string;
  IsGuest: boolean;
  Email: string;
  SessionID: string;
  IsActive: boolean;
  IsNewShopper: boolean;
  LastOrderID: null;
  CustomerImpersonation: null;
  JsonWebToken: null;
}
