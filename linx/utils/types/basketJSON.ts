export type Cart = Partial<WebPage>;

export interface WebPage {
  Response: Response;
  Model: Basket;
  PageInfo: PageInfo;
  Basket: Basket;
}

export interface Basket {
  Awards: unknown[];
  BasketHash: string;
  BasketID: number;
  Coupons: { Code: string }[];
  CreditCompetence: CreditCompetence;
  DeliveryAmount: number;
  DeliveryDiscountAmount: number;
  DeliveryDiscounts: unknown[];
  DeliveryETADays: number;
  DeliveryGroups: unknown[];
  DeliveryLoyaltyProgramPoints: number;
  DeliveryTotal: DeliveryTotal;
  DiscountAmount: number;
  Discounts: unknown[];
  GiftCertificates: unknown[];
  HasAllUndeliverableItems: boolean;
  HasunknownAdditionalService: boolean;
  HasunknownAvailableWrapping: boolean;
  HasunknownCustomization: boolean;
  HasunknownOutOfStockItem: boolean;
  HasunknownUndeliverableItem: boolean;
  HasunknownWishlist: boolean;
  HasCompetenceDiscount: boolean;
  HasLoyaltyProgram: boolean;
  HasPartiallyunknownOutOfStockItem: boolean;
  HasSeller: boolean;
  IsFreeShipping: boolean;
  IsPostalCodeReadonly: boolean;
  IsReadOnly: boolean;
  IsValid: boolean;
  ItemAwards: unknown[];
  ItemDiscounts: Discount[];
  Items: ItemDiscountItem[];
  LoyaltyCardAmount: number;
  LoyaltyCardPaymentAmount: number;
  LoyaltyCardsList: unknown[];
  LoyaltyProgramMode: string;
  LoyaltyProgramTotalOfProductPoints: number;
  MaxETADays: number;
  MinETADays: number;
  Navigation: Navigation[];
  OrderTypeID: number;
  Payments: unknown[];
  PaymentTerms: unknown[];
  PostalCode: string;
  PostalCodeAddress: string;
  ProductAdditionals: unknown[];
  ProductAdditionalServices: unknown[];
  Quote: null;
  SelectedDeliveryOption: null;
  SelectedDeliveryOptionList: unknown[];
  Sellers: unknown[];
  SingleDeliveryOption: boolean;
  SplitDeliveryGroups: unknown[];
  SubTotal: number;
  TaxAmount: number;
  TaxationAmount: number;
  Total: number;
  TotalWithoutDiscounts: number;
  Upsells: unknown[];
  Wishlist: null;
}

export interface CreditCompetence {
  Amount: number;
  AvailableAmount: number;
  ClaimedAmount: number;
  Reference: null;
}

export interface DeliveryTotal {
  AmountTotal: number;
  EstimatedUnit: null;
  ETAHighest: null;
  ETATotalSeconds: number;
  IsMarketPlacleEnableAndViewTypeList: boolean;
}

export interface ItemDiscountItem {
  Additionals: unknown[];
  Awards: unknown[];
  BasketItemID: number;
  BasketItemValidation: BasketItemValidation;
  BasketPrice: number;
  BrandName: string;
  BundleAdjustType: string;
  BundleAdjustValue: number;
  BundleKitDiscount: string;
  BundleKitDiscountValue: number;
  BundlePriceType: string;
  BundleType: string;
  CatalogItemType: number;
  CategoryName: string;
  CustomerRelation: CustomerRelation;
  Customizations: unknown[];
  DeliveryGroupKey: null;
  DirectProductID: number;
  Discounts: Discount[];
  GiftCertificateProductData: GiftCertificateProductData;
  HasCustomization: boolean;
  HasLoyaltyProgram: boolean;
  HasNestedServices: boolean;
  HasPromotion: boolean;
  HasSkuOptions: boolean;
  ImagePath: string;
  IsDeliverable: boolean;
  IsEditableItem: boolean;
  IsFreeShipping: boolean;
  IsMergedItem: boolean;
  IsPreviousItem: boolean;
  IsRemovableItem: boolean;
  IsWishlistItem: boolean;
  ListPrice: number;
  LoyaltyProgramPoints: number;
  Name: string;
  Nested: unknown[];
  PaymentTermID: number;
  Priority: number;
  Product: Product;
  ProductAdditionalID: number;
  ProductAdditionalIndex: number;
  ProductAuctionID: number;
  ProductID: number;
  ProductItem: Item;
  ProductPath: string;
  ProductTypeID: number;
  PurchasingFormData: unknown[];
  Quantity: number;
  RetailPrice: number;
  Seller: Seller;
  SKU: string;
  SkuID: number;
  SkuItem: Item;
  SkuName: string;
  SkuOptions: unknown[];
  SpecialType: string;
  SubCategoryName: string;
  SubTotal: number;
  Tax: number;
  TaxationAmount: number;
  UrlFriendly: string;
  VariationPath: string;
  Warehouses: number[];
  Wishlist: Wishlist;
}

export interface Discount {
  Amount: number;
  CouponCode: string;
  ExternalItemsIdentifier: null;
  ExternalPromotionName: null;
  Item?: ItemDiscountItem;
  Message: string;
  ProductID: number;
  PromotionID: number;
  Reference: string;
  Type: string;
}

export interface BasketItemValidation {
  IsValid: boolean;
  RequiredQuantity: number;
  SimilarDestinationUrl: null;
  Status: null;
}

export interface CustomerRelation {
  AddressID: number;
  CustomerID: number;
  Name: null;
  TradingName: null;
}

export interface GiftCertificateProductData {
  Email: null;
  Message: null;
  Name: null;
}

export interface Product {
  AllowOnlyAdditionalPurchase: boolean;
  Availability: string;
  AvailabilityText: string;
  Backorderable: boolean;
  BrandID: number;
  BrandImageUrl: string;
  BrandName: string;
  BrandUrl: string;
  BrowsingImage: BrowsingImage;
  BrowsingImages: BrowsingImage[];
  CatalogItemBehavior: string;
  CatalogItemTypeID: number;
  CategoryItems: CategoryItem[];
  ClickUrl: null;
  Condition: string;
  CurrentSellerID: number;
  CurrentSkuID: number;
  Descriptions: ProductDescription[];
  DisplayCondition: boolean;
  DisplayPrice: string;
  DisplayStockQuantity: boolean;
  EstimatedReorderDate: null;
  ExtendedMetadatas: ProductDescription[];
  Flags: Flag[];
  HasCurrentSkuID: boolean;
  HasEstimatedReorderDate: boolean;
  HasPickup: boolean;
  IntegrationID: string;
  IsFreeShipping: boolean;
  IsGiftCertificate: boolean;
  IsInventoryAvailable: boolean;
  IsNew: boolean;
  IsPromotion: boolean;
  IsPurchasable: boolean;
  IsUndeliverable: boolean;
  IsUponRequest: boolean;
  Items: ProductItem[];
  JoinCollection: null;
  LeafCategoryId: number;
  LeafCategoryName: string;
  LeafCategoryUrl: string;
  ListPrice: number;
  LoyaltyProgramPoints: unknown[];
  MediaGroups: MediaGroup[];
  Medias: BrowsingImage[];
  MediaSmall: string;
  MetaDescription: string;
  MetaKeywords: string;
  MininumOfDistinctSKUs: number;
  MininumOfSKUsQuantity: number;
  Name: string;
  NewFrom: string;
  NewTo: null;
  Options: unknown[];
  OutOfStockFrom: null;
  OutOfStockTo: null;
  PageTitle: string;
  Preorderable: boolean;
  PreorderDate: string;
  Price: null;
  PriceDescription: null;
  ProductDefinition: null;
  ProductDefinitionID: number;
  ProductID: number;
  ProductSelection: ProductSelection;
  ProductTypeID: number;
  PromotionFrom: string;
  PromotionOnlyCheckout: boolean;
  PromotionPrice: number;
  PromotionTo: string;
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
  Tags: Tag[];
  Tax: number;
  TaxationAmount: number;
  Uom: string;
  Url: string;

  VisibleFrom: string;
  VisibleTo: null;
}

export interface BrowsingImage {
  Attributes: unknown[];
  HasMediaPath: boolean;
  Height: number;
  Index: number;
  MaxHeight: number;
  MaxWidth: number;
  MediaPath: string;
  MediaSizeType: string;
  MediaType: string;
  ProductPath: string;
  Title: null;
  Url: null;
  VariationPath: string;
  Width: number;
}

export interface CategoryItem {
  ID: string;
  Name: string;
  ParentID: string;
}

export interface ProductDescription {
  Alias: string;
  Color: null | string;
  GroupName: null | string;
  GroupType: string;
  ImagePath: null | string;
  Name: string;
  Order: number;
  PropertyMetadataID: number;
  PropertyPath: string;
  Reference: null | string;
  Title: string;
  Value: string;
  ValueAlias: string;
}

export interface Flag {
  Alias: string;
  FlagID: number;
  ImagePath: null | string;
  Label: string;
}

export interface ProductItem {
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
  EstimatedReorderDate: null;
  ExtendedMetadatas: ProductDescription[];
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
  Items: ProductItem[];
  ListPrice: number;
  LoyaltyProgramPoints: LoyaltyProgramPoint[];
  MaximumQtyAllowed: number;
  MinimumQtyAllowed: number;
  Name: string;
  Options: unknown[];
  Order: number;
  OutOfStockFrom: null;
  OutOfStockHandlingDays: number;
  OutOfStockTo: null;
  Preorderable: boolean;
  PreorderDate: string;
  Price: null;
  PriceDescription: null;
  ProductDefinition: null;
  ProductID: number;
  ProductLevel: number;
  ProductPath: string;
  ProductTypeID: number;
  PromotionFrom: string;
  PromotionPrice: number;
  PromotionTo: string;
  ReplenishmentStatus: string;
  RetailPrice: number;
  SKU: string;
  SKUOptions: unknown[];
  StockBalance: number;
  Tax: number;
  TaxationAmount: number;
  UPC: null | string;
  UrlFriendly: string;

  VariationLevel: number;
  VariationPath: string;
  Weight: number;
  Width: number;
}

export interface LoyaltyProgramPoint {
  ForceNull: boolean;
  LoyaltyProgramID: number;
  Points: number;
  ProductID: number;
}

export interface MediaGroup {
  Custom: null;
  IsPurchasable: boolean;
  Large: BrowsingImage;
  Medias: BrowsingImage[];
  MediaType: string;
  Medium: BrowsingImage;
  ProductLevel: number;
  ProductPath: string;
  Small: BrowsingImage;
  Thumbnail: BrowsingImage;
  VariationLevel: number;
  VariationPath: string;
  Zoom: BrowsingImage;
}

export interface ProductSelection {
  PropertyLevel: number;
  PropertyPath: string;
  Quantity: number;
  SkuID: number;
}

export interface Tag {
  Label: string;
  TagID: number;
}

export interface Item {
  Descriptions: ProductItemDescription[];
  ExtendedMetadatas: ProductItemDescription[];
}

export interface ProductItemDescription {
  DisplayName: string;
  PropertyMetadataID: number;
  PropertyName: string;
  Value: null | string;
}

export interface Seller {
  DeliveryAmount: number;
  ETA: number;
  HasDeliveryOptions: boolean;
  HasLimits: boolean;
  HasSeller: boolean;
  PurchaseLimit: PurchaseLimit;
  SellerID: null;
  SellerName: string | null;
}

export interface PurchaseLimit {
  Evaluation: null;
  SalesSubTotalLimit: null;
  SalesSubTotalMaximum: null;
  SalesUnitLimit: null;
  SalesUnitLimitMaximum: null;
}

export interface Wishlist {
  AvailableQuantity: number;
  DeliveryAddressID: null;
  Hash: string;
  Name: null;
  Url: string;
  UrlFriendly: null;
  WishlistDefinitionID: number;
  WishlistDefinitionName: null;
  WishlistID: number;
}

export interface Navigation {
  CustomUrl: null;
  Depth: number;
  ID: number;
  Text: string;
  Url: string;
  UrlFriendly: string;
}

export interface PageInfo {
  AlternateTitle: null;
  BodyClass: string;
  CanonicalLink: string;
  CanonicalNextLink: string;
  CanonicalPrevLink: string;
  DefaultAlternateTitle: null;
  DefaultDescription: null;
  DefaultMetaDescription: string;
  DefaultMetaKeywords: string;
  DefaultPageTitle: string;
  Description: null;
  HttpStatusCode: number;
  IndexPage: boolean;
  MetaDescription: null;
  MetaKeywords: null;
  PageTitle: string;
  RouteClass: string;
  SectionClass: null;
}

export interface Response {
  Errors: unknown[];
  IsValid: boolean;
  RefreshBasket: boolean;
  ResponseCallBack: ResponseCallBack;
  SuccessMessage: null;
  Url: null;
  Warnings: unknown[];
}

export interface ResponseCallBack {
  Code: string;
  Parameters: unknown[];
  Value: string;
}
