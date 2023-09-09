export interface API {
  "GET /web-api/v1/Catalog/Products/Datasource/:id": {
    response: ProductListDataSource;
  };
  "GET /web-api/v1/Catalog/Products/Get/:id": {
    response: productDetailPage;
  };
}

export interface Attribute {
  name: string;
  mandatory: boolean;
  values: string[];
}

export interface ProductListDataSource {
  Products: ProductItemGrid[];
  SortOptions: SortOption[];
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
  Tags: string[];
  Medias: MediaProduct[];
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

export interface productDetailPage {
  Product: ProductItemGrid[];
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

export interface SortOption {
  Alias: string;
  Label: string;
  Selected: boolean;
}
