import { LinxInstallment } from "./installments.ts";
import {
  CategoryItem,
  Facet,
  LinxError,
  LinxMetadata,
  NavigationInfo,
  Path,
  ProductSelection,
  ProviderCapabilities,
  ResponseCallBack,
  SellerInfo,
  SortOption,
  Spell,
} from "./shared.ts";

export interface WebPage {
  Response: Response;
  Model: Model;
  PageInfo: PageInfo;
  PageParameters: PageParameters;
}

export interface Model {
  Grid: Grid;
  Message: null;
  Navigation: NavigationInfo[];
  ProductAuctions: ProductAuction[];
  SortAlias: null;
}

export interface Grid {
  Facets: Facet[];
  HasNextPage: boolean;
  HasPreviousPage: boolean;
  HasProducts: boolean;
  PageCount: number;
  PageFirst: number;
  PageIndex: number;
  PageLast: number;
  PageNumber: number;
  PageSize: number;
  ProductCount: number;
  Products: Product[];
  ProviderCapabilities: ProviderCapabilities;
  Query: string;
  SortOptions: SortOption[];
  Spell: Spell;
  Terms: unknown[];
}

export interface Product {
  AllowOnlyAdditionalPurchase: boolean;
  Availability: Availability;
  AvailabilityText: AvailabilityText;
  Backorderable: boolean;
  BrandID: number;
  BrandImageUrl: string;
  BrandName: BrandName;
  BrandUrl: BrandURL;
  BrowsingImage: BrowsingImage;
  BrowsingImages: BrowsingImage[];
  CatalogItemBehavior: CatalogItemBehavior;
  CatalogItemTypeID: number;
  CategoryItems: CategoryItem[];
  ClickUrl: null;
  Condition: string;
  CurrentSellerID: number;
  CurrentSkuID: number;
  Descriptions: LinxMetadata[];
  DisplayCondition: boolean;
  DisplayPrice: DisplayPrice;
  DisplayStockQuantity: boolean;
  EstimatedReorderDate: Date | null;
  ExtendedMetadatas: LinxMetadata[];
  Flags: unknown[];
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
  Items: Item[];
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
  ProductDefinition: null;
  ProductDefinitionID: number;
  ProductID: number;
  ProductSelection: ProductSelection;
  ProductTypeID: number;
  PromotionFrom: Date | null;
  PromotionOnlyCheckout: boolean;
  PromotionPrice: number;
  PromotionTo: null;
  PropertyPath: string;
  PurchasingFormID: number;
  QuantityReturned: null;
  RatingAverage: number;
  RatingCount: number;
  ReplenishmentStatus: ReplenishmentStatus;
  RetailPrice: number;
  RetailPriceMax: number;
  RetailPriceMin: number;
  ReviewCount: number;
  RootCategoryName: RootCategoryName;
  RootCategoryUrl: RootCategoryURL;
  ShortDescription: string;
  SKU: string;
  StockBalance: string;
  StockOnHand: string;
  Tags: unknown[];
  Tax: number;
  TaxationAmount: number;
  Uom: string;
  Url: string;
  UrlHelper: PageParameters;
  VisibleFrom: Date;
  VisibleTo: null;
}

export type Availability = "B" | "I";

export type AvailabilityText = "Venda sem estoque" | "Em estoque";

export type BrandName = "Joias Vip";

export type BrandURL = "joias-vip";

export interface BrowsingImage {
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

export type MediaSizeType = "Small" | "Thumbnail" | "Medium" | "Large" | "Zoom";

export type MediaType = "Image";

export type CatalogItemBehavior = "Default";

export type Alias =
  | "WarrantyDescription"
  | "LongDescription"
  | "Specifications"
  | "id_leilao"
  | "SelecionarAro"
  | "Pedra"
  | "rank_products_mostseen"
  | "rank_products_mostsold"
  | "tema"
  | "detalhe"
  | "Metal"
  | "malha"
  | "dimantes_aliancas"
  | "metal_aliancas"
  | "cor_da_gema"
  | "peso";

export type GroupType = "Description" | "Extended";

export type Name =
  | "Garantia"
  | "Descrição"
  | "Medidas"
  | "ID do leilão"
  | "Seleção de aro"
  | "Pedra"
  | "Mais Acessados"
  | "Mais Vendidos"
  | "Modelo"
  | "Detalhe"
  | "Metal"
  | "Malha"
  | "Cor da Gema"
  | "Peso";

export type DisplayPrice = "Y";

export interface Item {
  Availability: Availability;
  AvailabilityText: AvailabilityText;
  Backorderable: boolean;
  BackorderLimit: null;
  BundleAdjustType: BundleAdjustType;
  BundleAdjustValue: number;
  BundleGroup: null;
  BundleHierarchyPrice: null;
  BundleKitDiscount: BundleKitDiscount;
  BundleKitDiscountValue: number;
  BundlePriceType: BundlePriceType;
  BundleQuantity: number;
  BundleType: BundleType;
  BuyBox: null;
  CatalogItemBehavior: CatalogItemBehavior;
  CatalogItemTypeID: number;
  ComposeMinPrice: boolean;
  Depth: number;
  Edit: null;
  EstimatedReorderDate: Date | null;
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
  PreorderDate: Date;
  Price: Price | null;
  PriceDescription: string;
  ProductDefinition: null;
  ProductID: number;
  ProductLevel: number;
  ProductPath: string;
  ProductTypeID: number;
  PromotionFrom: Date | null;
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

export type BundleAdjustType = "None";

export type BundleKitDiscount = "Percent";

export type BundlePriceType = "Fixed";

export type BundleType = "AllProducts";

export interface LoyaltyProgramPoint {
  ForceNull: boolean;
  LoyaltyProgramID: number;
  Points: number;
  ProductID: number;
}

export interface Price {
  BestInstallment: LinxInstallment;
  BestInstallmentCreditCard: LinxInstallment | null;
  BuyBox: SellerInfo;
  CurrentPaymentTerm: null;
  HasBuyBox: boolean;
  HasMunknownSkus: boolean;
  HasSalesPrice: boolean;
  IsNullPrice: boolean;
  ItemAddFreeItem: null;
  ListPrice: number;
  ListPriceWithTax: number;
  MaxInstallmentsNoInterest: LinxInstallment;
  MaxInstallmentsWithInterest: null;
  SalesPrice: number;
  SalesPriceDiscount: number;
  SalesPriceWithTax: number;
  SalesPriceWithTaxDiscount: number;
  Tax: number;
  TaxationAmount: number;
}

// deno-lint-ignore no-empty-interface
export interface PageParameters {
}

export interface MediaGroup {
  Custom: null;
  IsPurchasable: boolean;
  Large: BrowsingImage;
  Medias: BrowsingImage[];
  MediaType: MediaType;
  Medium: BrowsingImage;
  ProductLevel: number;
  ProductPath: string;
  Small: BrowsingImage;
  Thumbnail: BrowsingImage;
  VariationLevel: number;
  VariationPath: Path;
  Zoom: BrowsingImage;
}

export type ReplenishmentStatus = "Normal" | "Discontinued";

export type RootCategoryName = "Joias";

export type RootCategoryURL = "/joias";

export interface ProductAuction {
  BidAmountMultiplier: number;
  ExecutionFrom: Date;
  ExecutionTo: Date;
  InitialAmount: number;
  IsExecuting: boolean;
  MarketAmount: number;
  MarketAmountMultiplier: number;
  MinimunBidAmount: number;
  Name: string;
  ProductAuctionID: number;
  ProductID: number;
  ProductImage: string;
  ReservationMultiplier: number;
  SkuID: number;
  VisibleFrom: Date;
  VisibleTo: Date;
}

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
  SectionClass: string;
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
