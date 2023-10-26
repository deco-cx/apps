export interface ProductBaseSalesforce {
  currency: "USD" | "BRL";
  id: string;
  brand?: string;
  imageGroups: ImageGroups[];
  inventory: Inventory;
  longDescription: string;
  master?: Master;
  minOrderQuantity: number;
  name: string;
  pageDescription?: string;
  pageTitle?: string;
  price: number;
  priceMax?: number;
  pricePerUnit: number;
  primaryCategoryId: string;
  productPromotions?: string;
  shortDescription?: string;
  slugUrl: string;
  stepQuantity: number;
  type: Type;
  validFrom?: ValidFrom;
  variants?: Variants[];
  variationAttributes?: VariationAttributes[];
  c_attributes: DynamicAttributes;
}

export interface productSearchSalesforce {
  limit: number;
  hits: Hit[];
  query: string;
  refinements: Refinement[];
  searchPhraseSuggestions: SearchPhraseSuggestions;
  sortingOptions: SortingOption[];
  offset: number;
  total: number;
}

export interface Refinement {
  attributeId: string;
  label: string;
  values: Refinementvalue[];
}

export interface Refinementvalue {
  hitCount: number;
  label: string;
  value: string;
  presentationId?: string;
}

export interface SearchPhraseSuggestions {
  suggestedPhrases: SuggestedPhrase[];
  suggestedTerms: SuggestedTerm[];
}

export interface SuggestedPhrase {
  exactMatch: boolean;
  phrase: string;
}

export interface SuggestedTerm {
  originalTerm: string;
  terms: Term[];
}

export interface Term {
  completed: boolean;
  corrected: boolean;
  exactMatch: boolean;
  value: string;
}
// deno-lint-ignore no-explicit-any
export type DynamicAttributes = Record<string, any>;

export interface TokenBaseSalesforce {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
  token_type: "BEARER";
  usid: string;
  customer_id: string;
  enc_user_id: string;
  idp_access_token: string;
  idp_refresh_token: string;
}

export interface Images {
  alt: string;
  disBaseLink: string;
  link: string;
  title: string;
}

export interface ImageGroups {
  images: Images[];
  viewType: "large" | "medium" | "small" | "swatch";
  variationAttributes?: VariationImageGroups[];
}

export interface VariationImageGroups {
  id: string;
  values: [
    {
      value: string;
    },
  ];
}

export interface Inventory {
  ats: number;
  backorderable: boolean;
  id: string;
  orderable: boolean;
  preorderable: boolean;
  stockLevel: number;
}

export interface Master {
  masterId: string;
  orderable: boolean;
  price: number;
}

export interface Type {
  master: boolean;
  bundle?: boolean;
  variant?: boolean;
  item?: boolean;
  option?: boolean;
}

export interface ValidFrom {
  default: string;
}

export interface Variants {
  orderable: boolean;
  price: number;
  productId: string;
  variationValues: Record<string, string>;
}

export interface VariationAttributes {
  id: string;
  name: string;
  values: VariationAttributesValues[];
}

export interface VariationAttributesValues {
  name: string;
  orderable: boolean;
  value: string;
}

export interface PDPParams {
  /**
   * @description inventory list ID
   */
  inventoryIds?: string;

  /**
   * @description If missing, all values will be returned.
   */
  expand?:
    | "availability"
    | "bundled_products"
    | "links"
    | "promotions"
    | "options"
    | "images"
    | "prices"
    | "variations"
    | "set_products"
    | "recommendations";

  /**
   * @description Retrieve the whole image model for the requested product.
   */
  allImages: boolean;

  /**
   * @description Retrieve the whole pricebook prices and tiered prices (if available) for the requested product.
   */
  perPricebook?: boolean;
}

export interface ProductSearchParams {
  /**
   * @title Category ID
   * @description Allows refinement per single category ID. Multiple category ids are not supported.
   */
  refine_cgid?: string;

  /**
   * @description Allows refinement per single price range. Multiple price ranges are not supported.
   * @example (100..300)
   */
  refine_price?: string;

  /**
   * @description Allows refinement per promotion ID.
   */
  refine_pmid?: string;

  /**
   * @description Allow refinement by including only the provided hit types. Hit type - ('product', 'master', 'set', 'bundle', 'variation_group'). A | can divide them
   */
  refine_htype?: string;

  /**
   * @description Unavailable products are excluded from the search results if true is set.
   */
  refine_orderable_only?: boolean;

  /**
   * @description The ID of the sorting option to sort the search hits.
   */
  sort?: string;

  /**
   * @description The expand parameter. A list with the allowed values (availability, images, prices, represented_products, variations). If the parameter is missing all the values will be returned.
   */
  expand?: string;

  /**
   * @description Used to retrieve the results based on a particular resource offset.
   */
  offset?: number;

  /**
   * @description Maximum records to retrieve per request, not to exceed 200. Defaults to 25.
   */
  limit?: number;
}

export interface Account {
  /**
   **@title Salesforce short code.
   * @description Salesforce account short code. For more info, read here: https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html.
   */
  shortCode: string;

  /**
   * @title Site ID.
   * @description Identification of site in Salesforce.
   */
  siteId: string;

  /**
   * @title Organization ID.
   * @description Identification of the organization in Salesforce.
   */
  organizationId: string;

  /**
   * @title Client ID.
   * @description Identification of the client in Salesforce.
   */
  clientId: string;

  /**
   * @title Client Secret.
   * @description Password of the client.
   */
  clientSecret: string;

  /**
   * @title Public store URL.
   * @description Domain of the site (for proxy config).
   */
  publicStoreUrl: string;

  /**
   * @title Currency
   * @description The currency of the items in Salesforce.
   * @default USD
   */
  currency: string;

  /**
   * @title Locale.
   * @description The locale of the items in Salesforce site.
   * @default en-US
   */
  locale: string;
}

export interface ProductSearch {
  limit: number;
  hits: ProductSearchHits[];
  query: string;
  refinements: ProductSearchRefinements[];
  searchPhraseSuggestions: ProductSearchSuggestions;
  sortingOptions: SortingOptions[];
  offset: number;
  total: number;
  // deno-lint-ignore no-explicit-any
  data?: any;
}

export interface ProductSearchHits {
  currency: "USD" | "BRL";
  hitType: "product" | "master" | "set" | "bundle";
  image: Images;
  orderable: boolean;
  price: number;
  pricePerUnit: number;
  productId: string;
  productName: string;
  productType: Type;
  representedProduct?: RepresentedProduct;
  representedProducts: RepresentedProduct[];
  variationAttributes: VariationAttributes[];
}

export interface RepresentedProduct {
  id: string;
}

export interface ProductSearchRefinements {
  attributeId: string;
  label: string;
  values?: ProductSearchRefinementsValues[];
}

export interface ProductSearchRefinementsValues {
  hitCount: number;
  label: string;
  presentationId?: string;
  value: string;
}

export interface ProductSearchSuggestions {
  suggestedPhrases: SuggestedPhrases[];
  suggestedTerms: SuggestedTerms[];
}

export interface SuggestedPhrases {
  exactMatch: boolean;
  phrase: string;
}

export interface SuggestedTerms {
  originalTerm: string;
  terms: SuggestedTermsValues[];
}

export interface SuggestedTermsValues {
  completed: boolean;
  corrected: boolean;
  exactMatch: boolean;
  value: string;
}

export interface SortingOptions {
  id: string;
  label: string;
}

export interface RefineParams {
  /**
   * @title Key id.
   * @description Declare the name of the extra prop. Example: c_refinementColor, c_tvType, etc
   */
  key: string;
  /**
   * @title Value.
   * @description Declare the value of the prop. For multiple values, use the pipe "|". Example: Black|White
   */
  value: string;
}
export interface PricingRange {
  /**
   * @title Minimum value.
   * @description Only numbers allowed.
   */
  minValue?: number;
  /**
   * @title Maximun value.
   * @description Only numbers allowed.
   */
  maxValue?: number;
}

export interface Basket {
  adjustedMerchandizeTotalTax?: number;
  adjustedShippingTotalTax?: number;
  agentBasket: boolean;
  basketId: string;
  channelType: string;
  couponItems?: CouponItems[];
  creationDate: string;
  currency: string;
  customerInfo: {
    customerId: string;
    email: string;
  };
  lastModified: string;
  locale: string;
  merchandizeTotalTax: number;
  giftCertificateItems: GiftCertificateItem[];
  orderTotal: number;
  productItems: ProductItems[];
  productSubTotal: number;
  productTotal: number;
  shipments: Shipments[];
  shippingItems: ShippingItems[];
  shippingTotal: number;
  shippingTotalTax: number;
  taxation: string;
  taxTotal: number;
}

export interface Shipments {
  adjustedMerchandizeTotalTax: number;
  adjustedShippingTotalTax: number;
  gift: boolean;
  merchandizeTotalTax: number;
  productSubTotal: number;
  productTotal: number;
  shipmentId: string;
  shipmentTotal: number;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  shippingStatus: string;
  shippingTotal: number;
  shippingTotalTax: number;
  taxTotal: number;
}

export interface ShippingItems {
  adjustedTax: number;
  basePrice: number;
  itemId: string;
  itemText: string;
  price: number;
  priceAfterItemDiscount: number;
  shipmentId: string;
  tax: number;
  taxBasis: number;
  taxClassId: string;
  taxRate: number;
}

export interface CouponItems {
  code: string;
  couponItemId: string;
  statusCode: string;
  valid: boolean;
}

export interface ProductItems {
  adjustedTax: number;
  basePrice: number;
  bonusProductLineItem: boolean;
  gift: boolean;
  image: Images;
  itemId: string;
  itemText: string;
  price: number;
  optionItems: OptionItem[];
  priceAfterItemDiscount: number;
  priceAfterOrderDiscount: number;
  productId: string;
  productName: string;
  quantity: number;
  shipmentId: string;
  tax: number;
  taxBasis: number;
  taxClassId: string;
  taxRate: number;
}

export interface billingAddress {
  address1: string;
  address2: string;
  city: string;
  companyName: string;
  countryCode: string;
  firstName: string;
  fullName: string;
  id: string;
  jobTitle: string;
  lastName: string;
  phone: string;
  postalCode: string;
  secondName: string;
  stateCode: string;
  title: string;
}

export interface paymentInstrument {
  amount: string;
  paymentInstrumentId: string;
  paymentMethodId: string;
  paymentCard?: {
    cardType: string;
    creditCardExpired: boolean;
  };
}

export interface OptionItem {
  adjustedTax: number;
  basePrice: number;
  bonusProductLineItem: boolean;
  gift: boolean;
  itemId: string;
  itemText: string;
  optionId: string;
  optionValueId: string;
  price: number;
  priceAfterItemDiscount: number;
  priceAfterOrderDiscount: number;
  productId: string;
  productName: string;
  quantity: number;
  shipmentId: string;
  tax: number;
  taxBasis: number;
  taxClassId: string;
  taxRate: number;
}

export interface ShippingAddress {
  address1: string;
  address2: string;
  city: string;
  companyName: string;
  countryCode: string;
  firstName: string;
  fullName: string;
  id: string;
  jobTitle: string;
  lastName: string;
  phone: string;
  postalCode: string;
  secondName: string;
  stateCode: string;
  title: string;
}

export interface ShippingMethod {
  description: string;
  id: string;
  name: string;
  price: number;
}

export interface GiftCertificateItem {
  amount: number;
  giftCertificateItemId: string;
  recipientEmail: string;
  shipmentId: string;
}

export interface Session {
  token: string;
  basketId: string;
}
export interface TokenBaseSalesforce {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
  token_type: "BEARER";
  usid: string;
  customer_id: string;
  enc_user_id: string;
  idp_access_token: string;
  idp_refresh_token: string;
}

export interface Hit {
  currency: string;
  hitType: string;
  image: Image;
  orderable: boolean;
  price: number;
  productId: string;
  productName: string;
  productType: ProductType;
  representedProduct: RepresentedProduct;
  representedProducts: RepresentedProduct[];
  variationAttributes: VariationAttributes[];
}

export interface ProductType {
  master: boolean;
}

export interface Image {
  alt: string;
  disBaseLink: string;
  link: string;
  title: string;
}

export interface SortingOption {
  id: string;
  label: string;
}
export interface BasketItems {
  productId: string;
  quantity: number;
}
export interface SelectedRefinement {
  key: string;
  value: string;
}
export type Sort =
  | "price-high-to-low"
  | "price-low-to-high"
  | "product-name-ascending"
  | "product-name-descending"
  | "brand"
  | "most-popular"
  | "top-sellers"
  | "";

export interface Product {
  currency: string;
  price: number;
  productId: string;
  productName: string;
}

export interface BrandSuggestions {
  suggestedPhrases: SuggestedPhrase[];
  suggestedTerms: SuggestedTerm[];
}

export interface Suggestions {
  brandSuggestions: BrandSuggestions;
  categorySuggestions: CategorySuggestions;
  productSuggestions: ProductSuggestions;
  searchPhrase: string;
}

export interface SuggestedOriginalTerm {
  originalTerm: string;
}

export interface CategorySuggestions {
  suggestedTerms: SuggestedOriginalTerm[];
}

export interface ProductSuggestions {
  products: Product[];
  suggestedPhrases: SuggestedPhrase[];
  suggestedTerms: SuggestedTerm[];
}

export interface SuggestionTerm {
  originalTerm: string;
  value: string;
}

export interface productSearchAddictionalInfo {
  name: string;
  id: string;
  primaryCategoryId: string;
  pageDescription: string;
  imageGroups: ImageGroups[];
  variants: Variants[];
  brand: string;
  productId: string;
}

export interface CategorySalesforce {
  categories: Category[];
  id: string;
  name: string;
  pageDescription: string;
  pageKeywords: string;
  pageTitle: string;
  parentCategoryId: string;
  parent_category_tree: ParentCategoryTree[];
  c_enableCompare: boolean;
  c_headerMenuOrientation: string;
  c_showInMenu: boolean;
}

export interface Category {
  id: string;
  image: string;
  name: string;
  pageDescription: string;
  pageKeywords: string;
  pageTitle: string;
  parentCategoryId: string;
  parent_category_tree: ParentCategoryTree[];
  c_enableCompare: boolean;
  c_showInMenu: boolean;
  c_slotBannerImage: string;
}

export interface ParentCategoryTree {
  id: string;
  name: string;
}
