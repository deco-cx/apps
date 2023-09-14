export interface API {
  "GET /web-api/v1/Catalog/Products/Datasource/:id/?catalogID=1": {
    response: ProductListDataSource;
  };
  "GET /web-api/v1/Catalog/Products/Brand/:id/?catalogID=1": {
    response: ProductListBrand;
  };
  "GET /web-api/v1/Catalog/Products/Category/:id/?catalogID=1": {
    response: ProductListCategory;
  };
  "GET /web-api/v1/Catalog/Products/Search/:id/?catalogID=1": {
    response: ProductListSearch;
  };
  "GET /web-api/v1/Catalog/Products/Flag/:id/?catalogID=1": {
    response: ProductListFlag;
  };
  "GET /web-api/v1/Catalog/Products/Get/:id": {
    response: productDetailPage;
  };
  "GET /web-api/v1/Shopping/Basket/Get": {
    response: OrderForm;
  };
  "POST /web-api/v1/Shopping/Basket/AddProduct": {
    response: OrderForm;
  };
}

export interface Attribute {
  name: string;
  mandatory: boolean;
  values: string[];
}

export interface OrderForm {
  Shopper: ShopperCart;
  IsValid: boolean;
  Errors: ErrorsCart;
}

export interface Cart {
  orderForm?: OrderForm;
}

export interface ShopperCart {
  Basket: BasketShopper;
  ShopperTicket: ShopperTicket;
}

export interface BasketShopper {
  BasketAuthorityToken: string;
  BasketID: string;
  Items: Array<Record<string, ProductSkuItems>> | ProductSkuItems[];
  DeliveryGroups: string[];
  DeliveryTotal: DeliveryTotal[];
  SplitDeliveryGroups: string[];
  SingleDeliveryOption: boolean;
  SelectedDeliveryOption: string;
  SelectedDeliveryOptionList: string[];
  PostalCode: string;
  PostalCodeAddress: string;
  IsPostalCodeReadonly: boolean;
  Awards: string[];
  ItemAwards: string[];
  Discounts: string[];
  Upsells: string[];
  PaymentTerms: string[];
  Payments: string[];
  CreditCompetence: CreditCompetence[];
  ItemDiscounts: string[];
  DeliveryDiscounts: string[];
  GiftCertificates: string[];
  Coupons: string[];
  DeliveryAmount: number;
  DeliveryDiscountAmount: number;
  DeliveryLoyaltyProgramPoints: string;
  DiscountAmount: number;
  TotalWithoutDiscounts: number;
  SubTotal: number;
  Total: number;
  IsFreeShipping: boolean;
  TaxAmount: number;
  TaxationAmount: number;
  LoyaltyCardsList: string[];
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
  Wishlist: string;
  ProductAdditionals: string[];
  ProductAdditionalServices: string[];
  IsValid: boolean;
  HasAnyOutOfStockItem: boolean;
  HasPartiallyAnyOutOfStockItem: boolean;
  HasAnyUndeliverableItem: boolean;
  Sellers: string[];
  HasSeller: boolean;
  LoyaltyProgramTotalOfProductPoints: number;
  LoyaltyProgramMode: string;
  HasAllUndeliverableItems: boolean;
  IsReadOnly: boolean;
  OrderTypeID: number;
  HasCompetenceDiscount: boolean;
  Quote: string;
  BasketHash: string;
}

export interface ErrorsCart {
  ErrorMessage: string;
  ErrorCode: string;
}

export interface CreditCompetence {
  Reference: string;
  Amount: number;
  ClaimedAmount: number;
  AvailableAmount: number;
}
export interface DeliveryTotal {
  IsMarketPlacleEnableAndViewTypeList: boolean;
  AmountTotal: number;
  ETAHighest: string;
  ETATotalSeconds: number;
  EstimatedUnit: string;
}

export interface ShopperTicket {
  ShopperTicketID: string;
  WebSiteID: string;
  CustomerID: string;
  CommingFromUrl: string;
  UtmSource: string;
  UtmMedium: string;
  UtmCampaign: string;
  UtmTerm: string;
  UtmContent: string;
  LastTicketID: string;
  CreatedDate: string;
  TrafficSourceID: string;
  BasketID: string;
  CustomerGroupIDs: string;
  IsAuthenticated: boolean;
  Name: string;
  IsGuest: string;
  Email: string;
  SessionID: string;
  IsActive: boolean;
  IsNewShopper: boolean;
  LastOrderID: string;
  CustomerImpersonation: string;
  JsonWebToken: string;
}

export interface ProductListDataSource {
  Products: ProductItemGrid[];
  SortOptions: SortOption[];
  PageInfo: PageInfo;
  Facets: Facets[];
}

export interface ProductListBrand {
  Products: ProductItemGrid[];
  SortOptions: SortOption[];
  PageInfo: PageInfo;
  Facets: Facets[];
}

export interface ProductListCategory {
  Products: ProductItemGrid[];
  SortOptions: SortOption[];
  PageInfo: PageInfo;
  Facets: Facets[];
}

export interface ProductListSearch {
  Products: ProductItemGrid[];
  SortOptions: SortOption[];
  PageInfo: PageInfo;
  Facets: Facets[];
}

export interface ProductListFlag {
  Products: ProductItemGrid[];
  SortOptions: SortOption[];
  PageInfo: PageInfo;
  Facets: Facets[];
}

export interface Facets {
  HasPreviousPage: boolean;
  HasNextPage: boolean;
  HasProducts: boolean;
  PageFirst: number;
  PageLast: number;
  PageNumber: number;
  PageIndex: number;
  PageCount: number;
  PageSize: number;
  ProductCount: number;
}

export interface PageInfo {
  HasPreviousPage: boolean;
  HasNextPage: boolean;
  HasProducts: boolean;
  PageFirst: number;
  PageLast: number;
  PageNumber: number;
  PageIndex: number;
  PageCount: number;
  PageSize: number;
  ProductCount: number;
}

export interface ProductItemGrid {
  Price: Price;
  ListPrice: number;
  RetailPrice: number;
  Url: string;
  IsFreeShipping: boolean;
  VisibleFrom: string;
  VisibleTo: string;
  BrandID: number;
  BrandName: string;
  BrandUrl: string;
  BrandImageUrl: string;
  Availability: string;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionTo: string;
  Items: Array<Record<string, ProductSkuItems>> | ProductSkuItems[];
  ShortDescription: string;
  DisplayPrice: string;
  Flags: FlagProduct[];
  Descriptions: DescriptionProduct[];
  Tags: string[];
  Medias: MediaProduct[];
  MediaGroups: MediaGroupsProduct[];
  MediaSmall: string;
  RatingAverage: number;
  RatingCount: number;
  ReviewCount: number;
  Options: string[];
  ProductID: string;
  SKU: string;
  Name: string;
}

export interface ProductSkuItems {
  VariationPath: string;
  VariationLevel: number;
  ProductPath: string;
  ProductLevel: number;
  MinimumQtyAllowed: number;
  MaximumQtyAllowed: number;
  UrlFriendly: string;
  ListPrice: number;
  RetailPrice: number;
  PromotionPrice: number;
  IsPromotion: boolean;
  PromotionFrom?: string;
  PromotionTo?: string;
  StockBalance: number;
  Options: string[];
  SKUOptions: string[];
  IsDeliverable: boolean;
  ProductID: number;
  SKU: string;
  Name: string;
  Price: Price;
}

export interface FlagProduct {
  FlagID: number;
  Alias: string;
  Label: string;
  ImagePath?: string;
}

export interface MediaProduct {
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
  Title: string;
  Url: string;
  Attributes: string[];
  HasMediaPath: boolean;
}

export interface MediaGroupsProduct {
  Medias: MediaProduct[];
  Medium: MediaProduct;
  Large: MediaProduct;
  Zoom: MediaProduct;
  MaxHeight: number;
  Width: number;
  Height: number;
  MediaSizeType: string;
  MediaPath: string;
  VariationPath: string;
  ProductPath: string;
  MediaType: string;
  Index: number;
  Title: string;
  Url: string;
  Attributes: string[];
  HasMediaPath: boolean;
}

export interface productDetailPage {
  Products: ProductItemGrid[];
}

export interface Price {
  MaxInstallmentsWithInterest: string;
  MaxInstallmentsNoInterest: PriceMaxInstallmentsNoInterest;
  BestInstallment: PriceBestInstallment;
  BestInstallmentCreditCard: string;
  ItemAddFreeItem: string;
  HasManySkus: boolean;
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
  BuyBox: PriceBuyBox;
  CurrentPaymentTerm: string;
  IsNullPrice: boolean;
}

export interface PriceMaxInstallmentsNoInterest {
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

export interface PriceBestInstallment {
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

export interface PriceBuyBox {
  SellerID: number;
  SellerName: string;
}

export interface DescriptionProduct {
  Alias: string;
  Name: string;
  Value: string;
}

export interface SortOption {
  Alias: string;
  Label: string;
  Selected: boolean;
}
