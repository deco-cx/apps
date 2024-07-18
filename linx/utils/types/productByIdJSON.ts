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
  BrowsingImages: BrowsingImage2[];
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
  PromotionTo: unknown;
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
  Options: Option3[];
  PropertyPath: string;
  CurrentSkuID: number;
  HasCurrentSkuID: boolean;
  Descriptions: Description[];
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
  ExtendedMetadatas: unknown[];
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
  Title: unknown;
  Url: unknown;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface BrowsingImage2 {
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
  Title: unknown;
  Url: unknown;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface Price {
  MaxInstallmentsWithInterest: unknown;
  MaxInstallmentsNoInterest: MaxInstallmentsNoInterest;
  BestInstallment: unknown;
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
  BuyBox: BuyBox;
  CurrentPaymentTerm: unknown;
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

export interface BuyBox {
  SellerID: number;
  SellerName: unknown;
}

export interface Item {
  Items: Item2[];
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
  BundleGroup: unknown;
  BundleType: string;
  BundlePriceType: string;
  BundleKitDiscount: string;
  BundleKitDiscountValue: number;
  ComposeMinPrice: boolean;
  PriceDescription?: string;
  ListPrice: number;
  RetailPrice: number;
  Tax: number;
  TaxationAmount: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom: unknown;
  PromotionTo: unknown;
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
  BackorderLimit: unknown;
  OutOfStockFrom: unknown;
  OutOfStockTo: unknown;
  UPC?: string;
  EstimatedReorderDate: unknown;
  HasEstimatedReorderDate: boolean;
  Options: Option2[];
  SKUOptions: Skuoption2[];
  BundleHierarchyPrice: unknown;
  IntegrationID: string;
  Edit: unknown;
  BuyBox: unknown;
  IsDeliverable: boolean;
  UrlHelper: unknown;
  ProductID: number;
  SKU: string;
  Name: string;
  ProductTypeID: number;
  CatalogItemTypeID: number;
  CatalogItemBehavior: string;
  ExtendedMetadatas: ExtendedMetadata2[];
  LoyaltyProgramPoints: unknown[];
  Price: unknown;
  ProductDefinition: unknown;
}

export interface Item2 {
  Items: unknown[];
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
  BundleGroup: unknown;
  BundleType: string;
  BundlePriceType: string;
  BundleKitDiscount: string;
  BundleKitDiscountValue: number;
  ComposeMinPrice: boolean;
  PriceDescription: unknown;
  ListPrice: number;
  RetailPrice: number;
  Tax: number;
  TaxationAmount: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom: unknown;
  PromotionTo: unknown;
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
  BackorderLimit: unknown;
  OutOfStockFrom: unknown;
  OutOfStockTo: unknown;
  UPC: string;
  EstimatedReorderDate: unknown;
  HasEstimatedReorderDate: boolean;
  Options: Option[];
  SKUOptions: Skuoption[];
  BundleHierarchyPrice: unknown;
  IntegrationID: string;
  Edit: unknown;
  BuyBox: unknown;
  IsDeliverable: boolean;
  UrlHelper: unknown;
  ProductID: number;
  SKU: string;
  Name: string;
  ProductTypeID: number;
  CatalogItemTypeID: number;
  CatalogItemBehavior: string;
  ExtendedMetadatas: ExtendedMetadata[];
  LoyaltyProgramPoints: unknown[];
  Price: unknown;
  ProductDefinition: unknown;
}

export interface Option {
  PropertyMetadataID: number;
  PropertyName: string;
  Label: string;
  IsVerificationRequired: boolean;
  HasVariationLayout: boolean;
  VariationLayoutTemplate: string;
  Values: unknown[];
}

export interface Skuoption {
  PropertyMetadataID: number;
  Alias: string;
  Name: string;
  Value: string;
  Title: string;
  PropertyPath: string;
  ValueAlias: string;
  Reference: unknown;
  Color: unknown;
  ImagePath: unknown;
  Order: number;
  GroupName: unknown;
  GroupType: string;
}

export interface ExtendedMetadata {
  PropertyMetadataID: number;
  Alias: string;
  Name: string;
  Value: string;
  Title: string;
  PropertyPath: string;
  ValueAlias: string;
  Reference: unknown;
  Color: unknown;
  ImagePath: unknown;
  Order: number;
  GroupName: unknown;
  GroupType: string;
}

export interface Option2 {
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
  Reference?: string;
  Color?: string;
  ImagePath?: string;
  IsSelected: boolean;
  Text: string;
  Value: string;
  Order: number;
  PropertyPath: string;
  GroupName?: string;
}

export interface Skuoption2 {
  PropertyMetadataID: number;
  Alias: string;
  Name: string;
  Value: string;
  Title: string;
  PropertyPath: string;
  ValueAlias: string;
  Reference: unknown;
  Color: unknown;
  ImagePath: unknown;
  Order: number;
  GroupName: unknown;
  GroupType: string;
}

export interface ExtendedMetadata2 {
  PropertyMetadataID: number;
  Alias: string;
  Name: string;
  Value: string;
  Title: string;
  PropertyPath: string;
  ValueAlias: string;
  Reference: unknown;
  Color: unknown;
  ImagePath: unknown;
  Order: number;
  GroupName: unknown;
  GroupType: string;
}

export interface CategoryItem {
  ID: string;
  ParentID: string;
  Name: string;
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
  Title: unknown;
  Url: unknown;
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
  Medias: Media2[];
  Thumbnail: Thumbnail;
  Small: Small;
  Medium: Medium;
  Large: Large;
  Zoom: Zoom;
  Custom: unknown;
}

export interface Media2 {
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
  Title: unknown;
  Url: unknown;
  Attributes: unknown[];
  HasMediaPath: boolean;
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
  Title: unknown;
  Url: unknown;
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
  Title: unknown;
  Url: unknown;
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
  Title: unknown;
  Url: unknown;
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
  Title: unknown;
  Url: unknown;
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
  Title: unknown;
  Url: unknown;
  Attributes: unknown[];
  HasMediaPath: boolean;
}

export interface Option3 {
  PropertyMetadataID: number;
  PropertyName: string;
  Label: string;
  IsVerificationRequired: boolean;
  HasVariationLayout: boolean;
  VariationLayoutTemplate: string;
  Values: Value2[];
}

export interface Value2 {
  HasItems: boolean;
  OptionID: number;
  Reference?: string;
  Color?: string;
  ImagePath?: string;
  IsSelected: boolean;
  Text: string;
  Value: string;
  Order: number;
  PropertyPath: string;
  GroupName?: string;
}

export interface Description {
  PropertyMetadataID: number;
  Alias: string;
  Name: string;
  Value: string;
  Title: string;
  PropertyPath: string;
  ValueAlias: string;
  Reference: unknown;
  Color: unknown;
  ImagePath: unknown;
  Order: number;
  GroupName: unknown;
  GroupType: string;
}

export interface ProductSelection {
  PropertyPath: string;
  PropertyLevel: number;
  SkuID: number;
  Quantity: number;
}

export interface SortOption {
  Alias: string;
  Label: string;
  Selected: boolean;
}

export interface Spell {
  Collation: string;
  Options: unknown[];
}
