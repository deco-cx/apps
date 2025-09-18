/**
 * @format dynamic-options
 * @options vtex/loaders/options/productIdByTerm.ts
 * @description Equivalent to sku ID in VTEX platform
 */
export type ProductID = string;

export interface OrderForm {
  orderFormId: string;
  salesChannel: string;
  loggedIn: boolean;
  isCheckedIn: boolean;
  storeId: null;
  checkedInPickupPointId: null;
  allowManualPrice: boolean;
  canEditData: boolean;
  userProfileId: null;
  userType: null;
  ignoreProfileData: boolean;
  value: number;
  messages: Message[];
  items: OrderFormItem[];
  selectableGifts: unknown[];
  totalizers: Totalizer[];
  shippingData: ShippingData;
  clientProfileData: ClientProfileData | null;
  paymentData: PaymentData;
  marketingData: MarketingData;
  sellers: Seller[];
  clientPreferencesData: ClientPreferencesData;
  commercialConditionData: null;
  storePreferencesData: StorePreferencesData;
  giftRegistryData: null;
  openTextField: null;
  invoiceData: null;
  customData: null;
  itemMetadata: ItemMetadata;
  hooksData: null;
  ratesAndBenefitsData: RatesAndBenefitsData;
  subscriptionData: null;
  merchantContextData: null;
  itemsOrdination: null;
}

export interface ClientProfileData {
  email: string;
  firstName: null;
  lastName: null;
  document: null;
  documentType: null;
  phone: null;
  corporateName: null;
  tradeName: null;
  corporateDocument: null;
  stateInscription: null;
  corporatePhone: null;
  isCorporate: boolean;
  profileCompleteOnLoading: boolean;
  profileErrorOnLoading: boolean;
  customerClass: null;
}

export interface ClientPreferencesData {
  locale: string;
  optinNewsLetter: null;
}

export interface ItemMetadata {
  items: ItemMetadataItem[];
}

export interface ItemMetadataItem {
  id: string;
  seller: string;
  name: string;
  skuName: string;
  productId: string;
  refId: string;
  ean: null | string;
  imageUrl: string;
  detailUrl: string;
  assemblyOptions: AssemblyOption[];
}

export interface AssemblyOption {
  id: Name;
  name: Name;
  required: boolean;
  inputValues: Schema;
  composition: null;
}

export enum Name {
  AlternativeSubstitute = "ALTERNATIVE_SUBSTITUTE",
  Substituto = "Substituto",
}

export interface Schema {
  Sku: Ean;
  Price: Ean;
  Qtde?: Ean;
  EAN: Ean;
  Measuremt_unit: Ean;
  Unit_multiplier: Ean;
  Quantity: Ean;
}

export interface Ean {
  maximumNumberOfCharacters: number;
  domain: unknown[];
}

export interface OrderFormItem {
  uniqueId: string;
  id: string;
  productId: string;
  productRefId: string;
  refId: string;
  ean: null | string;
  name: string;
  skuName: string;
  modalType: null | string;
  parentItemIndex: null;
  parentAssemblyBinding: null;
  assemblies: unknown[];
  priceValidUntil: Date;
  tax: number;
  price: number;
  listPrice: number;
  manualPrice: null;
  manualPriceAppliedBy: null;
  sellingPrice: number;
  rewardValue: number;
  isGift: boolean;
  additionalInfo: AdditionalInfo;
  preSaleDate: null;
  productCategoryIds: string;
  productCategories: { [key: string]: string };
  quantity: number;
  seller: string;
  sellerChain: string[];
  imageUrl: string;
  detailUrl: string;
  components: Component[];
  bundleItems: unknown[];
  attachments: unknown[];
  attachmentOfferings: AttachmentOffering[];
  offerings: Offering[];
  priceTags: PriceTag[];
  availability: string;
  measurementUnit: string;
  unitMultiplier: number;
  manufacturerCode: null;
  priceDefinition: PriceDefinition;
}

export interface AdditionalInfo {
  dimension: null;
  brandName: null | string;
  brandId: null | string;
  offeringInfo: null;
  offeringType: null;
  offeringTypeId: null;
}

export interface AttachmentOffering {
  name: Name;
  required: boolean;
  schema: Schema;
}

export interface Component {
  uniqueId: string;
  id: string;
  productId: null;
  productRefId: null;
  refId: string;
  ean: string;
  name: string;
  skuName: null;
  modalType: null;
  parentItemIndex: null;
  parentAssemblyBinding: null;
  assemblies: unknown[];
  priceValidUntil: null;
  tax: number;
  price: number;
  listPrice: null;
  manualPrice: null;
  manualPriceAppliedBy: null;
  sellingPrice: number;
  rewardValue: number;
  isGift: boolean;
  additionalInfo: AdditionalInfo;
  preSaleDate: null;
  productCategoryIds: null;
  productCategories: AvailableAssociations;
  quantity: number;
  seller: null;
  sellerChain: null[];
  imageUrl: null;
  detailUrl: null;
  components: unknown[];
  bundleItems: unknown[];
  attachments: unknown[];
  attachmentOfferings: unknown[];
  offerings: unknown[];
  priceTags: PriceTag[];
  availability: null;
  measurementUnit: string;
  unitMultiplier: number;
  manufacturerCode: null;
  priceDefinition: PriceDefinition;
}

export interface PriceDefinition {
  calculatedSellingPrice: number;
  total: number;
  sellingPrices: SellingPrice[];
}

export interface SellingPrice {
  value: number;
  quantity: number;
}

export interface PriceTag {
  name: string;
  value: number;
  rawValue: number;
  isPercentual: boolean;
  identifier: string;
  owner: string;
}

export type AvailableAssociations = Record<string, string>;

export interface MarketingData {
  utmSource: string | undefined;
  utmMedium: string | undefined;
  utmCampaign: string | undefined;
  utmiPage: string | undefined;
  utmiPart: string | undefined;
  utmiCampaign: string | undefined;
  coupon: string | undefined;
  marketingTags: string[] | undefined;
}

export interface Message {
  code: null | string;
  text: string;
  status: string;
  fields: Fields;
}

export interface Fields {
  ean?: string;
  itemIndex?: string;
  skuName?: string;
}

export interface PaymentData {
  updateStatus: string;
  installmentOptions: InstallmentOption[];
  paymentSystems: PaymentSystem[];
  payments: unknown[];
  giftCards: unknown[];
  giftCardMessages: unknown[];
  availableAccounts: unknown[];
  availableTokens: unknown[];
  availableAssociations: AvailableAssociations;
}

export interface InstallmentOption {
  paymentSystem: string;
  bin: null;
  paymentName: null;
  paymentGroupName: null;
  value: number;
  installments: CartInstallment[];
}

export interface CartInstallment {
  count: number;
  hasInterestRate: boolean;
  interestRate: number;
  value: number;
  total: number;
  sellerMerchantInstallments?: Installment[];
  id?: ID;
}

export enum ID {
  Carrefourbrfood = "CARREFOURBRFOOD",
}

export interface PaymentSystem {
  id: number;
  name: string;
  groupName: string;
  validator: Validator;
  stringId: string;
  template: string;
  requiresDocument: boolean;
  displayDocument: boolean;
  isCustom: boolean;
  description: null | string;
  requiresAuthentication: boolean;
  dueDate: Date;
  availablePayments: null;
}

export interface Validator {
  regex: null | string;
  mask: null | string;
  cardCodeRegex: CardCodeRegex | null;
  cardCodeMask: null | string;
  weights: number[] | null;
  useCvv: boolean;
  useExpirationDate: boolean;
  useCardHolderName: boolean;
  useBillingAddress: boolean;
}

export enum CardCodeRegex {
  The093$ = "^[0-9]{3}$",
  The094$ = "^[0-9]{4}$",
}

export interface RatesAndBenefitsData {
  rateAndBenefitsIdentifiers: RateAndBenefitsIdentifier[];
  teaser: unknown[];
}

export interface RateAndBenefitsIdentifier {
  id: string;
  name: string;
  featured: boolean;
  description: string;
  matchedParameters: MatchedParameters;
  additionalInfo: null;
}

export interface MatchedParameters {
  "Seller@CatalogSystem": string;
  "productCluster@CatalogSystem"?: string;
  "zipCode@Shipping"?: string;
  slaIds?: string;
}

export interface Seller {
  id: string;
  name: string;
  logo: string;
}

export interface ShippingData {
  address: Address;
  logisticsInfo: LogisticsInfo[];
  selectedAddresses: Address[];
  availableAddresses: Address[];
  pickupPoints: PickupPoint[];
}

export interface Address {
  addressType?: string;
  receiverName: string | null;
  addressId: string;
  isDisposable?: boolean;
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  addressName?: string;
  complement: string | null;
  reference?: string;
  geoCoordinates?: number[];
  name?: string;
}

export interface LogisticsInfo {
  itemIndex: number;
  selectedSla: SelectedSla | null;
  selectedDeliveryChannel: SelectedDeliveryChannel;
  addressId: string;
  slas: Sla[];
  shipsTo: string[];
  itemId: string;
  deliveryChannels: DeliveryChannel[];
}

export interface DeliveryChannel {
  id: SelectedDeliveryChannel;
}

export enum SelectedDeliveryChannel {
  Delivery = "delivery",
  PickupInPoint = "pickup-in-point",
}

export enum SelectedSla {
  ClickRetireRJS = "Click & Retire (RJS)",
  Normal = "Normal",
}

export interface Sla {
  id: SelectedSla;
  deliveryChannel: SelectedDeliveryChannel;
  name: SelectedSla;
  deliveryIds: DeliveryID[];
  shippingEstimate: string;
  shippingEstimateDate: null;
  lockTTL: null;
  availableDeliveryWindows: AvailableDeliveryWindow[];
  deliveryWindow: null;
  price: number;
  listPrice: number;
  tax: number;
  pickupStoreInfo: PickupStoreInfo;
  pickupPointId: null | string;
  pickupDistance: number | null;
  polygonName: string;
  transitTime: string;
}

export interface AvailableDeliveryWindow {
  startDateUtc: Date;
  endDateUtc: Date;
  price: number;
  lisPrice: number;
  tax: number;
}

export interface DeliveryID {
  courierId: string;
  warehouseId: string;
  dockId: string;
  courierName: string;
  quantity: number;
  kitItemDetails: unknown[];
}

export interface PickupStoreInfo {
  isPickupStore: boolean;
  friendlyName: null | string;
  address: Address | null;
  additionalInfo: null | string;
  dockId: null;
}

export interface PickupHolidays {
  date?: string;
  hourBegin?: string;
  hourEnd?: string;
}

export interface PickupPoint {
  friendlyName: string;
  address: Address;
  additionalInfo: string;
  id: string;
  businessHours: BusinessHour[];
  pickupHolidays?: PickupHolidays[];
}

export interface BusinessHour {
  DayOfWeek: number;
  OpeningTime: string;
  ClosingTime: string;
}

export interface StorePreferencesData {
  countryCode: string;
  saveUserData: boolean;
  timeZone: string;
  currencyCode: string;
  currencyLocale: number;
  currencySymbol: string;
  currencyFormatInfo: CurrencyFormatInfo;
}

export interface CurrencyFormatInfo {
  currencyDecimalDigits: number;
  currencyDecimalSeparator: string;
  currencyGroupSeparator: string;
  currencyGroupSize: number;
  startsWithCurrencySymbol: boolean;
}

export interface Totalizer {
  id: string;
  name: string;
  value: number;
  alternativeTotals?: Totalizer[];
}

export interface OrderFormItemInput {
  id?: number;
  index?: number;
  quantity?: number;
  seller?: string;
  uniqueId?: string;
  // options?: AssemblyOptionInput[]
}

export interface LegacySearchArgs {
  query?: string;
  page: number;
  count: number;
  type: "product_search" | "facets";
  selectedFacets?: SelectedFacet[];
  sort?: LegacySort;
}

export type LegacySort =
  | "OrderByPriceDESC"
  | "OrderByPriceASC"
  | "OrderByTopSaleDESC"
  | "OrderByReviewRateDESC"
  | "OrderByNameASC"
  | "OrderByNameDESC"
  | "OrderByReleaseDateDESC"
  | "OrderByBestDiscountDESC"
  | "OrderByScoreDESC"
  | "";

export type Fuzzy = "0" | "1" | "auto";

export interface SearchArgs {
  query?: string;
  page: number;
  count: number;
  type: "product_search" | "facets";
  sort?: Sort;
  selectedFacets?: SelectedFacet[];
  fuzzy?: Fuzzy;
  hideUnavailableItems?: boolean;
  locale?: string;
  segment?: Partial<Segment>;
}

export interface SelectedFacet {
  /**
   * @title Key
   * @description The key of the facet (e.g. "brand", "category-1", "productClusterIds")
   */
  key: string;
  /**
   * @title Value
   * @description The value of the facet
   */
  value: string;
}

export type Sort =
  | "price:desc"
  | "price:asc"
  | "orders:desc"
  | "name:desc"
  | "name:asc"
  | "release:desc"
  | "discount:desc"
  | "";

export interface Suggestion {
  searches: Search[];
}

export interface Search {
  term: string;
  count: number;
}

export interface ProductSearchResult {
  /**
   * @description Total of products.
   */
  recordsFiltered: number;
  products: Product[];
  pagination: Pagination;
  sampling: boolean;
  options: Options;
  translated: boolean;
  locale: string;
  query: string;
  operator: "and" | "or";
  redirect: string;
  fuzzy: string;
  correction?: Correction;
}

export interface Correction {
  misspelled: boolean;
}

export interface Options {
  sorts: {
    field: string;
    order: string;
    active?: boolean;
    proxyURL: string;
  }[];
  counts: Count[];
}

export interface Count {
  count: number;
  proxyURL: string;
}

export interface Pagination {
  count: number;
  current: Page;
  before: Page[];
  after: Page[];
  perPage: number;
  next: Page;
  previous: Page;
  first: Page;
  last: Page;
}

export interface Page {
  index: number;
  proxyUrl: string;
}

export interface First {
  index: number;
}

export interface Suggestion {
  searches: Search[];
}

export interface Search {
  term: string;
  count: number;
}

export interface IProduct {
  productId: string;
  productName: string;
  brand: string;
  brandId: number;
  brandImageUrl?: string;
  cacheId?: string;
  linkText: string;
  productReference: string;
  categoryId: string;
  clusterHighlights: Record<string, unknown>;
  productClusters: Record<string, string>;
  categories: string[];
  categoriesIds: string[];
  link: string;
  description: string;
  skuSpecifications?: SkuSpecification[];
  priceRange: PriceRange;
  specificationGroups: SpecificationGroup[];
  properties: Array<{ name: string; values: string[] }>;
  selectedProperties: Array<{ key: string; value: string }>;
  releaseDate: string;
  origin?: string;
}

export type Product = IProduct & {
  items: Item[];
  clusterHighlights: Array<{ id: string; name: string }>;
  productClusters: Array<{ id: string; name: string }>;
};

export type LegacyProduct = IProduct & {
  metaTagDescription: string;
  productTitle: string;
  items: LegacyItem[];
  allSpecifications: string[];
  allSpecificationsGroups?: string[];
};

export type LegacyFacets = {
  Departments: LegacyFacet[];
  CategoriesTrees: LegacyFacet[];
  Brands: LegacyFacet[];
  SpecificationFilters: Record<string, LegacyFacet[]>;
  PriceRanges: LegacyFacet[];
};

export interface PageType {
  id: string | null;
  name: string | null;
  url: string | null;
  title: string | null;
  metaTagDescription: string | null;
  pageType:
    | "Brand"
    | "Category"
    | "Department"
    | "SubCategory"
    | "Product"
    | "Collection"
    | "Cluster"
    | "NotFound"
    | "FullText"
    | "Search";
}

export interface Category {
  id: number;
  name: string;
  hasChildren: boolean;
  children: Category[];
  url: string;
  Title?: string;
  MetaTagDescription?: string;
}

export interface LegacyFacet {
  Id: number;
  Quantity: number;
  Name: string;
  Link: string;
  LinkEncoded: string;
  Map: string;
  Value: string;
  Slug?: string;
  Children: LegacyFacet[];
}

export interface Image {
  imageId: string;
  imageLabel: string | null;
  imageTag: string;
  imageUrl: string;
  imageText: string;
}

export interface Installment {
  Value: number;
  InterestRate: number;
  TotalValuePlusInterestRate: number;
  NumberOfInstallments: number;
  PaymentSystemName: string;
  PaymentSystemGroupName: string;
  Name: string;
}

export type LegacyItem = Omit<Item, "variations" | "videos"> & {
  variations: string[];
  Videos: string[];
} & Record<string, string[]>;

export interface Item {
  itemId: string;
  name: string;
  nameComplete: string;
  complementName: string;
  ean: string;
  estimatedDateArrival: string;
  referenceId?: Array<{ Key: string; Value: string }>;
  measurementUnit: string;
  unitMultiplier: number;
  modalType: string | null;
  images: Image[];
  videos: string[];
  variations: Array<{
    name: string;
    values: string[];
  }>;
  sellers: Seller[];
  attachments: Array<{
    id: number;
    name: string;
    required: boolean;
    domainValues: string;
  }>;
  isKit: boolean;
  kitItems?: Array<{
    itemId: string;
    amount: number;
  }>;
}

export interface TeasersParametersLegacy {
  "<Name>k__BackingField": string;
  "<Value>k__BackingField": string;
}

export interface TeasersConditionsLegacy {
  "<MinimumQuantity>k__BackingField": number;
  "<Parameters>k__BackingField": TeasersParametersLegacy[];
}

export interface TeasersEffectLegacy {
  "<Parameters>k__BackingField": TeasersParametersLegacy[];
}

export interface TeasersLegacy {
  "<Name>k__BackingField": string;
  "<GeneralValues>k__BackingField": unknown;
  "<Conditions>k__BackingField": TeasersConditionsLegacy;
  "<Effects>k__BackingField": TeasersEffectLegacy;
}

export interface TeasersParameters {
  name: string;
  value: string;
}

export interface TeasersConditions {
  minimumQuantity: number;
  parameters: TeasersParameters[];
}

export interface TeasersEffect {
  parameters: TeasersParameters[];
}

export interface Teasers {
  name: string;
  generalValues?: unknown;
  conditions: TeasersConditions;
  effects: TeasersEffect;
}

export interface CommertialOffer {
  DeliverySlaSamplesPerRegion: Record<
    string,
    { DeliverySlaPerTypes: unknown[]; Region: unknown | null }
  >;
  Installments: Installment[];
  DiscountHighLight: unknown[];
  GiftSkuIds: string[];
  Teasers: TeasersLegacy[];
  teasers?: Teasers[];
  BuyTogether: unknown[];
  ItemMetadataAttachment: unknown[];
  Price: number;
  ListPrice: number;
  spotPrice: number;
  PriceWithoutDiscount: number;
  RewardValue: number;
  PriceValidUntil: string;
  AvailableQuantity: number;
  Tax: number;
  DeliverySlaSamples: Array<{
    DeliverySlaPerTypes: unknown[];
    Region: unknown | null;
  }>;
  GetInfoErrorMessage: unknown | null;
  CacheVersionUsedToCallCheckout: string;
}

export interface Seller {
  sellerId: string;
  sellerName: string;
  addToCartLink: string;
  sellerDefault: boolean;
  commertialOffer: CommertialOffer;
}

export interface SkuSpecification {
  field: SKUSpecificationField;
  values: SKUSpecificationValue[];
}
export interface SKUSpecificationValue {
  name: string;
  id?: string;
  fieldId?: string;
  originalName?: string;
}

export interface SKUSpecificationField {
  name: string;
  originalName?: string;
  id?: string;
}

export interface Price {
  highPrice: number | null;
  lowPrice: number | null;
}

export interface PriceRange {
  sellingPrice: Price;
  listPrice: Price;
}

export interface SpecificationGroup {
  name: string;
  originalName: string;
  specifications: Array<{
    name: string;
    originalName: string;
    values: string[];
  }>;
}

export type FilterType = RangeFacet["type"] | BooleanFacet["type"];

export interface FacetSearchResult {
  facets: Facet[];
  breadcrumb: Breadcrumb[];
}

export interface BaseFacet {
  name: string;
  hidden: boolean;
  key: string;
  quantity: number;
}

export interface RangeFacet extends BaseFacet {
  type: "PRICERANGE";
  values: FacetValueRange[];
}

export interface BooleanFacet extends BaseFacet {
  type: "TEXT" | "NUMBER";
  values: FacetValueBoolean[];
}

export type Facet = RangeFacet | BooleanFacet;

export interface FacetValueBoolean {
  quantity: number;
  name: string;
  key: string;
  value: string;
  selected: boolean;
  href: string;
}

export interface FacetValueRange {
  selected: boolean;
  quantity: number;
  range: {
    from: number;
    to: number;
  };
}

export interface Breadcrumb {
  href: string;
  name: string;
}

export interface SKU {
  id: number;
  quantity: number;
  seller: string;
}

export interface SimulationOrderForm {
  items: Item[];
  ratesAndBenefitsData: RatesAndBenefitsData;
  paymentData: PaymentData;
  selectableGifts: unknown[];
  marketingData?: MarketingData;
  postalCode: string;
  country: string;
  logisticsInfo: LogisticsInfo[];
  messages: Message[];
  purchaseConditions: PurchaseConditions;
  pickupPoints: PickupPoint[];
  subscriptionData?: unknown;
  totals: Total[];
  itemMetadata?: ItemMetadata;
  allowMultipleDeliveries: boolean;
}

export interface Total {
  id: string;
  name: string;
  value: number;
}

export interface PurchaseConditions {
  itemPurchaseConditions: ItemPurchaseCondition[];
}

export interface ItemPurchaseCondition {
  id: string;
  seller: string;
  sellerChain: string[];
  slas: Sla[];
  price: number;
  listPrice: number;
}

export interface DeliveryId {
  courierId: string;
  warehouseId: string;
  dockId: string;
  courierName: string;
  quantity: number;
  kitItemDetails: unknown[];
}

export interface Installment {
  count: number;
  hasInterestRate: boolean;
  interestRate: number;
  value: number;
  total: number;
  sellerMerchantInstallments: SellerMerchantInstallment[];
}

export interface SellerMerchantInstallment {
  id: string;
  count: number;
  hasInterestRate: boolean;
  interestRate: number;
  value: number;
  total: number;
}

export interface Teaser {
  featured: boolean;
  id: string;
  name: string;
  conditions: Conditions;
  effects: Effects;
  teaserType: string;
}

export interface Effects {
  parameters: Parameter[];
}

export interface Conditions {
  parameters: Parameter[];
  minimumQuantity: number;
}

export interface Parameter {
  name: string;
  value: string;
}

export interface PriceDefinition {
  calculatedSellingPrice: number;
  total: number;
  sellingPrices: SellingPrice[];
}

export interface SellingPrice {
  value: number;
  quantity: number;
}

export interface Offering {
  type: string;
  id: string;
  name: string;
  allowGiftMessage: boolean;
  attachmentOfferings: unknown[];
  price: number;
}

export type CrossSellingType =
  | "whosawalsosaw"
  | "whosawalsobought"
  | "whoboughtalsobought"
  | "showtogether"
  | "accessories"
  | "similars"
  | "suggestions";

export interface CrossSellingArgs {
  productId: string;
  type: CrossSellingType;
}

export interface Segment {
  campaigns: unknown | null;
  /** @description 1,2,3 etc */
  channel: string;
  priceTables: string | null;
  regionId: string | null;
  utm_campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utmi_campaign: string | null;
  utmi_page: string | null;
  utmi_part: string | null;
  /** @description BRL, USD stc */
  currencyCode: string;
  /** @description R$, $ etc */
  currencySymbol: string;
  /** @description BRA, USA etc */
  countryCode: string;
  /** @description pt-BR, en-US etc */
  cultureInfo: string;
  channelPrivacy: "public" | "private";
}

export interface WishlistItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
}

export interface PortalSuggestion {
  itemsReturned: ItemsReturned[];
}

export interface ItemsReturned {
  items: Item[];
  thumb: string;
  thumbUrl: null | string;
  name: string;
  href: string;
  criteria: null | string;
}

export interface Item {
  productId: string;
  itemId: string;
  name: string;
  nameComplete: string;
  imageUrl: string;
}

export interface SimulationItem {
  id: number;
  quantity: number;
  seller: string;
}

export type SPEvent =
  | {
    type: "session.ping";
    url: string;
  }
  | {
    type: "page.cart";
    products: {
      productId: string;
      quantity: number;
    }[];
  }
  | {
    type: "page.empty_cart";
    // Empty array is converted to a invalid json schema... so, let it be anything.
    // deno-lint-ignore ban-types
    products: {};
  }
  | {
    type: "page.confirmation";
    order: string;
    products: {
      productId: string;
      quantity: number;
      price: number;
    }[];
  }
  | {
    type: "search.click";
    position: number;
    text: string;
    productId: string;
    url: string;
  }
  | {
    type: "search.query";
    url: string;
    text: string;
    misspelled: boolean;
    match: number;
    operator: string;
    locale: string;
  };

export interface CreateNewDocument {
  Id?: string;
  Href?: string;
  DocumentId?: string;
}

export interface Document extends Record<string, unknown> {
  additionalProperties?: string;
  id?: string;
  accountId?: string;
  accountName?: string;
  dataEntityId?: string;
}

export interface SelectableGifts {
  id: string;
  selectedGifts: {
    id: string;
    seller: string;
    index: number;
  }[];
}

export interface Brand {
  id: number;
  name: string;
  isActive: boolean;
  title: string;
  metaTagDescription: string;
  imageUrl: string | null;
}

export interface Collection {
  id: number;
  name: "Live influencers";
  searchable: boolean;
  highlight: boolean;
  dateFrom: string;
  dateTo: string;
  totalSku: number;
  totalProducts: number;
  type: "Manual" | "Automatic" | "Hybrid";
  lastModifiedBy?: string;
}

export interface CollectionList {
  paging: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
    limit: number;
  };
  items?: Collection[];
}

export interface ProductRatingAndReviews {
  productRating?: ProductRating;
  productReviews?: ProductReviewData;
}

export interface ProductRating {
  average?: number;
  totalCount?: number;
}

export interface ProductReview {
  id?: string | undefined;
  productId?: string | undefined;
  rating?: number | undefined;
  title?: string | undefined;
  text?: string | undefined;
  reviewerName?: string | undefined;
  shopperId?: string | undefined;
  reviewDateTime?: string | undefined;
  searchDate?: string | undefined;
  verifiedPurchaser?: boolean | undefined;
  sku?: string | null;
  approved?: boolean;
  location?: string | null;
  locale?: string | null;
  pastReviews?: string | null;
}

export interface ProductReviewRange {
  total?: number;
  from?: number;
  to?: number;
}

export interface ProductReviewData {
  data?: ProductReview[] | undefined;
  range?: ProductReviewRange;
}

export interface ProductBalance {
  hasUnlimitedQuantity?: boolean;
  leadTime?: string;
  reservedQuantity?: number;
  totalQuantity?: number;
  warehouseId?: string;
  warehouseName?: string;
}

export interface ProductInventoryData {
  skuId?: string;
  balance?: ProductBalance[];
}

interface OrderPlacedSeller {
  id: string;
  name: string;
  logo: string;
}

export interface OrderPlaced {
  sellers: OrderPlacedSeller[];
  orderId: string;
  orderGroup: string;
  state: string;
  isCheckedIn: boolean;
  sellerOrderId: string;
  storeId: string | null;
  checkedInPickupPointId: string | null;
  value: number;
  items: OrderFormItem[];
  totals: Total[];
  clientProfileData: ClientProfileData;
  ratesAndBenefitsData: RatesAndBenefitsData;
  shippingData: ShippingData;
  paymentData: PaymentData;
  clientPreferencesData: ClientPreferencesData;
  commercialConditionData: null;
  giftRegistryData: null;
  marketingData: MarketingData | null;
  storePreferencesData: StorePreferencesData;
  openTextField: null;
  invoiceData: null;
  itemMetadata: ItemMetadata;
  taxData: null;
  customData: null;
  hooksData: null;
  changeData: null;
  subscriptionData: null;
  merchantContextData: null;
  purchaseAgentData: null;
  salesChannel: string;
  followUpEmail: string;
  creationDate: string;
  lastChange: string;
  timeZoneCreationDate: string;
  timeZoneLastChange: string;
  isCompleted: boolean;
  hostName: string;
  merchantName: string | null;
  userType: string;
  roundingError: number;
  allowEdition: boolean;
  allowCancellation: boolean;
  isUserDataVisible: boolean;
  cancellationData: CancelattionData;
  orderFormCreationDate: string;
  marketplaceRequestedCancellationWindow: null;
}

interface CancelattionData {
  requestedByUser: true;
  reason: string;
  cancellationDate: string;
  cancellationRequestId: string;
  requestedBy: null;
  cancellationSource: null;
}

export interface Order {
  ShippingEstimatedDate?: Date;
  ShippingEstimatedDateMax: string;
  ShippingEstimatedDateMin: string;
  affiliateId: string;
  authorizedDate: string;
  callCenterOperatorName: string;
  clientName: string;
  creationDate: string;
  currencyCode: string;
  deliveryDates: Date[];
  giftCardProviders: string[];
  hostname: string;
  invoiceInput: string;
  invoiceOutput: string[];
  isAllDelivered: boolean;
  isAnyDelivered: boolean;
  items: OrderFormItem[];
  lastChange: string;
  lastMessageUnread: string;
  listId: string;
  listType: string;
  marketPlaceOrderId: string;
  orderFormId: string;
  orderId: string;
  orderIsComplete: boolean;
  origin: string;
  paymentApprovedDate: string;
  paymentNames: string;
  salesChannel: string;
  sequence: string;
  status: string;
  statusDescription: string;
  totalItems: number;
  totalValue: number;
  workflowInErrorState: boolean;
  workflowInRetry: boolean;
}

export interface Orders {
  facets: Facet[];
  list: Order[];
  paging: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
  reportRecordsLimit: number;
  stats: {
    stats: {
      totalItems: {
        Count: number;
        Max: number;
        Mean: number;
        Min: number;
        Missing: number;
        StdDev: number;
        Sum: number;
        SumOfSquares: number;
      };
      totalValue: {
        Count: number;
        Max: number;
        Mean: number;
        Min: number;
        Missing: number;
        StdDev: number;
        Sum: number;
        SumOfSquares: number;
      };
    };
  };
}

export interface SalesChannel {
  Id?: number;
  Name?: string;
  IsActive?: boolean;
  ProductClusterId?: number | null;
  CountryCode?: string;
  CultureInfo?: string;
  TimeZone?: string;
  CurrencyCode?: string;
  CurrencySymbol?: string;
  CurrencyLocale?: number;
  CurrencyFormatInfo?: {
    CurrencyDecimalDigits?: number;
    CurrencyDecimalSeparator?: string;
    CurrencyGroupSeparator?: string;
    CurrencyGroupSize?: number;
    StartsWithCurrencySymbol?: boolean;
  };
  Origin?: string | null;
  Position?: number | null;
  ConditionRule?: string | null;
  CurrencyDecimalDigits?: number;
}

export interface Promotion {
  idCalculatorConfiguration: string;
  name: string;
  beginDateUtc: string;
  endDateUtc: string;
  lastModified: string;
  daysAgoOfPurchases: number;
  isActive: boolean;
  isArchived: boolean;
  isFeatured: boolean;
  disableDeal: boolean;
  activeDaysOfWeek: number[];
  offset: number;
  activateGiftsMultiplier: boolean;
  newOffset: number;
  maxPricesPerItems: string[];
  cumulative: boolean;
  nominalShippingDiscountValue: number;
  absoluteShippingDiscountValue: number;
  nominalDiscountValue: number;
  nominalDiscountType: string;
  maximumUnitPriceDiscount: number;
  percentualDiscountValue: number;
  rebatePercentualDiscountValue: number;
  percentualShippingDiscountValue: number;
  percentualTax: number;
  shippingPercentualTax: number;
  percentualDiscountValueList1: number;
  percentualDiscountValueList2: number;
  skusGift: {
    quantitySelectable: number;
    gifts: number;
  };
  nominalRewardValue: number;
  percentualRewardValue: number;
  orderStatusRewardValue: string;
  applyToAllShippings: boolean;
  nominalTax: number;
  maxPackValue: number;
  origin: string;
  idSellerIsInclusive: boolean;
  idsSalesChannel: string[];
  areSalesChannelIdsExclusive: boolean;
  marketingTags: string[];
  marketingTagsAreNotInclusive: boolean;
  paymentsMethods: {
    id: string;
    name: string;
  }[];
  stores: string[];
  campaigns: string[];
  storesAreInclusive: boolean;
  categories: {
    id: string;
    name: string;
  }[];
  categoriesAreInclusive: boolean;
  brands: {
    id: string;
    name: string;
  }[];
  brandsAreInclusive: boolean;
  products: {
    id: string;
    name: string;
  }[];
  productsAreInclusive: boolean;
  skus: {
    id: string;
    name: string;
  }[];
  skusAreInclusive: boolean;
  collections1BuyTogether: {
    id: string;
    name: string;
  }[];
  collections2BuyTogether: {
    id: string;
    name: string;
  }[];
  minimumQuantityBuyTogether: number;
  quantityToAffectBuyTogether: number;
  enableBuyTogetherPerSku: boolean;
  listSku1BuyTogether: {
    id: string;
    name: string;
  }[];
  listSku2BuyTogether: {
    id: string;
    name: string;
  }[];
  coupon: string[];
  totalValueFloor: number;
  totalValueCeling: number;
  totalValueIncludeAllItems: boolean;
  totalValueMode: string;
  collections: {
    id: string;
    name: string;
  }[];
  collectionsIsInclusive: boolean;
  restrictionsBins: string[];
  cardIssuers: string[];
  totalValuePurchase: number;
  slasIds: string[];
  isSlaSelected: boolean;
  isFirstBuy: boolean;
  firstBuyIsProfileOptimistic: boolean;
  compareListPriceAndPrice: boolean;
  isDifferentListPriceAndPrice: boolean;
  zipCodeRanges: {
    zipCodeFrom: string;
    zipCodeTo: string;
    inclusive: string;
  }[];
  itemMaxPrice: number;
  itemMinPrice: number;
  installment: number;
  isMinMaxInstallments: boolean;
  minInstallment: number;
  maxInstallment: number;
  merchants: string[];
  clusterExpressions: string[];
  clusterOperator: string;
  paymentsRules: string[];
  giftListTypes: string[];
  productsSpecifications: string[];
  affiliates: {
    id: string;
    name: string;
  }[];
  maxUsage: number;
  maxUsagePerClient: number;
  shouldDistributeDiscountAmongMatchedItems: boolean;
  multipleUsePerClient: boolean;
  accumulateWithManualPrice: boolean;
  type: string;
  useNewProgressiveAlgorithm: boolean;
  percentualDiscountValueList: number[];
  isAppliedToMostExpensive: boolean;
  maxNumberOfAffectedItems: number;
  maxNumberOfAffectedItemsGroupKey: string;
}

export interface AdvancedLoaderConfig {
  /** @description Specifies an array of attribute names from the original object to be directly included in the transformed object. */
  includeOriginalAttributes: string[];

  /** @description Allow this field if you prefer to use description instead of metaTagDescription */
  preferDescription?: boolean;
}

export type Maybe<T> = T | null | undefined;

export interface AddressInput {
  name?: string;
  addressName: string;
  addressType?: string;
  city?: string;
  complement?: string;
  country?: string;
  geoCoordinates?: number[];
  neighborhood?: string;
  number?: string;
  postalCode?: string;
  receiverName?: string;
  reference?: string;
  state?: string;
  street?: string;
}

export interface SavedAddress {
  id: string;
  cacheId: string;
}

export type SimulationBehavior = "default" | "skip" | "only1P";

export enum DeviceType {
  Mobile = "MOBILE",
  Tablet = "TABLET",
  Desktop = "DESKTOP",
}

export interface LoginSession {
  id: string;
  cacheId: string;
  deviceType: DeviceType;
  city?: Maybe<string>;
  lastAccess: string;
  browser?: Maybe<string>;
  os?: Maybe<string>;
  ip?: Maybe<string>;
  fullAddress?: Maybe<string>;
  firstAccess: string;
}

export interface LoginSessionsInfo {
  currentLoginSessionId?: Maybe<string>;
  loginSessions?: Maybe<LoginSession[]>;
}

export interface Session {
  id: string;
  namespaces?: {
    profile: SessionProfile;
    impersonate: SessionImpersonate;
    authentication: Record<string, string>;
    public: SessionPublic;
  };
}

export interface SessionProfile {
  id?: { value: string };
  email?: { value: string };
  firstName?: { value: string };
  lastName?: { value: string };
  phone?: { value: string };
  isAuthenticated?: { value: string };
  priceTables?: { value: string };
}

export interface SessionImpersonate {
  storeUserEmail?: { value: string };
  storeUserId?: { value: string };
}

export interface SessionPublic {
  orderFormId?: { value: string };
  utm_source?: { value: string };
  utm_medium?: { value: string };
  utm_campaign?: { value: string };
  utm_term?: { value: string };
  utm_content?: { value: string };
  utmi_cp?: { value: string };
  utmi_pc?: { value: string };
  utmi_p?: { value: string };
}

export interface ProfileCustomField {
  key?: Maybe<string>;
  value?: Maybe<string>;
}

export interface PaymentProfile {
  cacheId?: Maybe<string>;
  id?: Maybe<string>;
  paymentSystem?: Maybe<string>;
  paymentSystemName?: Maybe<string>;
  cardNumber?: Maybe<string>;
  address?: Maybe<Address>;
  isExpired?: Maybe<boolean>;
  expirationDate?: Maybe<string>;
  accountStatus?: Maybe<string>;
}

export interface Profile {
  cacheId?: Maybe<string>;
  firstName?: Maybe<string>;
  lastName?: Maybe<string>;
  profilePicture?: Maybe<string>;
  email?: Maybe<string>;
  document?: Maybe<string>;
  userId?: Maybe<string>;
  birthDate?: Maybe<string>;
  gender?: Maybe<string>;
  homePhone?: Maybe<string>;
  businessPhone?: Maybe<string>;
  addresses?: Maybe<Address[]>;
  isCorporate?: Maybe<boolean>;
  corporateName?: Maybe<string>;
  corporateDocument?: Maybe<string>;
  stateRegistration?: Maybe<string>;
  payments?: Maybe<PaymentProfile[]>;
  customFields?: Maybe<ProfileCustomField[]>;
  passwordLastUpdate?: Maybe<string>;
  pii?: Maybe<boolean>;
  tradeName?: Maybe<string>;
}

export interface ProfileInput {
  email: string;
  firstName?: Maybe<string>;
  lastName?: Maybe<string>;
  document?: Maybe<string>;
  phone?: Maybe<string>;
  birthDate?: Maybe<string>;
  gender?: Maybe<string>;
  homePhone?: Maybe<string>;
  businessPhone?: Maybe<string>;
  tradeName?: Maybe<string>;
  corporateName?: Maybe<string>;
  corporateDocument?: Maybe<string>;
  stateRegistration?: Maybe<string>;
  isCorporate?: Maybe<boolean>;
}

export interface AuthResponse {
  authStatus: string | "WrongCredentials" | "BlockedUser" | "Success";
  promptMFA: boolean;
  clientToken: string | null;
  authCookie: {
    Name: string;
    Value: string;
  } | null;
  accountAuthCookie: {
    Name: string;
    Value: string;
  } | null;
  expiresIn: number;
  userId: string | null;
  phoneNumber: string | null;
  scope: string | null;
}

export interface AuthProvider {
  providerName: string;
  className: string;
  expectedContext: unknown[];
}

export interface StartAuthentication {
  authenticationToken: string | null;
  oauthProviders: AuthProvider[];
  showClassicAuthentication: boolean;
  showAccessKeyAuthentication: boolean;
  showPasskeyAuthentication: boolean;
  authCookie: string | null;
  isAuthenticated: boolean;
  selectedProvider: string | null;
  samlProviders: unknown[];
}

export interface CanceledOrder {
  date?: string;
  orderId?: string;
  receipt?: string | null;
}

export interface ReceiptData {
  ReceiptCollection: Receipt[];
}

export interface Receipt {
  ReceiptType: string;
  Date: string;
  ReceiptToken: string;
  Source: string;
  InvoiceNumber: string | null;
  TransactionId: string;
  MerchantName: string;
  SellerOrderId: string | null;
  ValueAsInt: number | null;
}

export interface CancellationData {
  requestedByUser: boolean;
  reason: string;
  cancellationDate: string;
  cancellationRequestId: string;
  requestedBy: string | null;
  cancellationSource: string | null;
}

export interface OrderFormOrder {
  sellers: Seller[];
  receiptData?: ReceiptData;
  sequence?: string;
  marketPlaceOrderId?: string;
  origin?: number;
  items: OrderFormItem[];
  giftRegistryData?: unknown;
  contextData?: unknown;
  marketPlaceOrderGroup?: string | null;
  marketplaceServicesEndpoint?: string | null;
  orderFormId?: string;
  affiliateId?: string;
  status?: string;
  callCenterOperator?: string;
  userProfileId?: string;
  creationVersion?: string;
  creationEnvironment?: string;
  lastChangeVersion?: string;
  workflowInstanceId?: string;
  workflowInstanceGroupId?: string | null;
  marketplacePaymentValue?: number | null;
  marketplacePaymentReferenceValue?: number | null;
  marketplace?: string | null;
  orderId: string;
  orderGroup: string;
  state: string;
  isCheckedIn: boolean;
  sellerOrderId: string;
  storeId?: string | null;
  checkedInPickupPointId?: string | null;
  value: number;
  totals: Total[];
  clientProfileData: ClientProfileData;
  ratesAndBenefitsData: RatesAndBenefitsData;
  shippingData: ShippingData;
  paymentData: PaymentData;
  clientPreferencesData: ClientPreferencesData;
  commercialConditionData?: unknown;
  marketingData?: MarketingData | null;
  storePreferencesData: StorePreferencesData;
  openTextField?: unknown;
  invoiceData?: unknown;
  itemMetadata: ItemMetadata;
  taxData?: unknown;
  customData?: unknown;
  hooksData?: unknown;
  changeData?: unknown;
  subscriptionData?: unknown;
  merchantContextData?: unknown;
  purchaseAgentData?: unknown;
  salesChannel: string;
  followUpEmail?: string;
  creationDate: string;
  lastChange: string;
  timeZoneCreationDate: string;
  timeZoneLastChange: string;
  isCompleted: boolean;
  hostName: string;
  merchantName?: string | null;
  userType?: string;
  roundingError?: number;
  allowEdition?: boolean;
  allowCancellation?: boolean;
  isUserDataVisible?: boolean;
  allowChangeSeller?: boolean;
  cancellationData?: CancellationData;
  orderFormCreationDate?: string;
  marketplaceRequestedCancellationWindow?: unknown;
}
