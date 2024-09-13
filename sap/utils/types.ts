export type Sort =
  | "relevance"
  | "topRated"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export interface Facet {
  key: string;
  value: string;
}

export interface Stock {
  isValueRounded: boolean;
  stockLevel: number;
  stockLevelStatus: string;
}

export interface Image {
  altText: string;
  format: string;
  galleryIndex: number;
  imageType: string;
  url: string;
}

export interface VariantOptionQualifier {
  name: string;
  qualifier: string;
  value: string;
  image: Image;
}

export interface VariantOption {
  code: string;
  priceData: PriceData;
  stock: Stock;
  url: string;
  variantOptionQualifiers: VariantOptionQualifier[];
}

export interface PriceData {
  currencyIso: string;
  value: number;
  formattedValue: string;
  priceType: string;
  maxQuantity?: number;
  minQuantity?: number;
}

export interface Category {
  code: string;
  image: Image;
  name: string;
  url: string;
}

export interface ProductClassification {
  code: string;
  features: {
    code: string;
    comparable: boolean;
    description: string;
    featureUnit: {
      name: string;
      symbol: string;
      unitType: string;
    };
    featureValues: {
      value: string;
    }[];
    name: string;
    range: boolean;
    type: string;
  };
  name: string;
}

export interface Promotion {
  code: string;
  couldFireMessages: string[];
  description: string;
  enabled: boolean;
  endDate: Date;
  firedMessages: string[];
  priority: number;
  productBanner: Image;
  promotionGroup: string;
  promotionType: string;
  restrictions: {
    description: string;
    restrictionType: string;
  };
  startDate: Date;
  title: string;
}

export interface Currency {
  active: boolean;
  isocode: string;
  name: string;
  symbol: string;
}

export interface Review {
  alias: string;
  comment: string;
  date: Date;
  headline: string;
  id: string;
  principal: User;
}

export interface VariantMatrix {
  elements: string[];
  isLeaf: boolean;
  parentVariantCategory: {
    hasImage: boolean;
    name: string;
    priority: number;
  };
  variantOption: {
    code: string;
    priceData: PriceData;
    stock: Stock;
    url: string;
    variantOptionQualifiers: VariantOptionQualifier[];
    variantValueCategory: {
      name: string;
      sequence: number;
      superCategories: {
        hasImage: boolean;
        name: string;
        priority: number;
      }[];
    };
  };
}

export interface ColorVariant {
  "altText": string;
  "approvalStatus": string;
  "code": string;
  "color": string;
  "colorPriority": number;
  "depth": string;
  "height": string;
  "isConsumerVisUS": boolean;
  "mapUSD": number;
  "msrpCAD": number;
  "msrpCADFormattedValue": string;
  "msrpUSD": number;
  "name": number;
  "pimStatus": "";
  "plpBadges": [
    {
      "icon": string;
      "name": string;
    },
    {
      "icon": string;
      "name": string;
    },
  ];
  "plpImage": string;
  "price": PriceData;
  "saleable": true;
  "url": string;
  "variantSwatchColors": string;
  "width": string;
}

export interface Product {
  approvalStatus: string;
  availableForPickup: boolean;
  averageRating: number;
  baseProduct: string;
  brand: string;
  categories: Category[];
  categoryName: string;
  classifications: ProductClassification[];
  code: string;
  colorVariants: ColorVariant[];
  configurable: boolean;
  configuratorType: string;
  description: string;
  firstVariantCode: string;
  firstVariantImage: string;
  futureStocks: {
    date: Date;
    formattedDate: string;
    stock: Stock;
  }[];
  images: Image[];
  mapUSD: number;
  manual: boolean;
  manufacturer: string;
  multidimensional: string;
  name: string;
  numberOfReviews: number;
  packageBullet1: string;
  packageBullet2: string;
  packageBullet3: string;
  packageBullet4: string;
  packageBullet5: string;
  packageBullet6: string;
  plpImage: string;
  promotions: Promotion[];
  price: PriceData;
  priceRange: {
    maxPrice: PriceData;
    minPrice: PriceData;
  };
  productReferences: {
    description: string;
    preselected: boolean;
    quantity: number;
    referenceType: string;
  };
  purchasable: boolean;
  reviews: Review[];
  stock: Stock;
  summary: string;
  tags: string[];
  url: string;
  variantMatrix: VariantMatrix[];
  variantOption: VariantOption[];
  variantType: string;
  volumePrices: PriceData[];
  volumePricesFlag: boolean;
}

export interface SearchSort {
  code: string;
  name: string;
  selected: boolean;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  sort: string;
  totalPages: number;
  totalResults: number;
}

export interface Breadcrumb {
  facetCode: string;
  facetName: string;
  facetValueCode: string;
  facetValueName: string;
  removeQuery: {
    query: {
      value: string;
    };
    url: string;
  };
  truncateQuery: {
    query: {
      value: string;
    };
    url: string;
  };
}

export interface FacetResponse {
  category: boolean;
  multiSelect: boolean;
  name: string;
  priority: number;
  topValues: [
    {
      count: number;
      name: string;
      query: {
        query: {
          value: string;
        };
        url: string;
      };
      selected: boolean;
    },
  ];
  values: [
    {
      count: number;
      name: string;
      query: {
        query: {
          value: string;
        };
        url: string;
      };
      selected: boolean;
    },
  ];
  visible: boolean;
}

export interface ProductDetailsOption {
  code: string;
  priceData: PriceData;
  stock: Stock;
  url: string;
  variantOptionQualifiers: VariantOptionQualifier[];
}

export interface ProductDetailsBaseOption {
  options: ProductDetailsOption[];
  selected: ProductDetailsOption & { variantType: string };
  variantType: string;
}

export interface Brand {
  id: string;
  name: string;
  url: string;
}

export interface Category extends Brand {
  subcategories: Category[];
}

export interface Collection extends Category {}

export interface CatalogVersion {
  categories: Category[];
  id: "Staged" | "Online";
  url: string;
}

export interface Catalog {
  catalogVersions: CatalogVersion[];
  id: string;
  name: string;
  url: string;
}

export interface ConsumedEntry {
  code: string;
  adjustedUnitPrice: number;
  orderEntryNumber: number;
  quantity: number;
}

export interface AppliedPromotion {
  consumedEntries: ConsumedEntry[];
  description: string;
  promotion: Promotion;
}

export interface AppliedVoucher {
  appliedValue: PriceData;
  code: string;
  currency: Currency;
  description: string;
  freeShipping: boolean;
  name: string;
  value: number;
  valueFormatted: string;
  valueString: string;
  voucherCode: string;
}

export interface CostCenter {
  active: boolean;
  activeFlag: boolean;
  code: string;
  currency: {
    active: boolean;
    isocode: string;
    name: string;
    symbol: string;
  };
  name: string;
  originalCode: string;
}

export interface DeliveryMode {
  code: string;
  deliveryCost: PriceData;
  description: string;
  name: string;
}

export interface TimeFormatted {
  formattedHHour: string;
  hour: number;
  minute: number;
}

export interface CartEntry {
  basePrice: PriceData;
  cancellableQuantity: number;
  cancelledItemsPrice: PriceData;
  configurationInfos: {
    configurationLabel: string;
    configurationValue: string;
    configuratorType: string;
    status: string;
  }[];
  deliveryMode: DeliveryMode;
  deliveryPointOfService: {
    address: Address;
    description: string;
    displayName: string;
    distanceKm: number;
    features: {
      additionalProp1: string;
      additionalProp2: string;
      additionalProp3: string;
    };
    formattedDistance: string;
    geoPoint: {
      latitude: number;
      longitude: number;
    };
    mapIcon: Image;
    name: string;
    openingHours: {
      code: string;
      name: string;
      specialDayOpeningList: {
        closed: true;
        closingTime: TimeFormatted;
        comment: string;
        date: Date;
        formattedDate: string;
        name: string;
        openingTime: TimeFormatted;
      };
      weekDayOpeningList: {
        closed: true;
        closingTime: TimeFormatted;
        openingTime: TimeFormatted;
        weekDay: string;
      };
    };
    storeContent: string;
    storeImages: Image[];
    url: string;
    warehouseCodes: string[];
  };
  entryNumber: number;
  product: Product;
  quantity: number;
  quantityAllocated: number;
  quantityCancelled: number;
  quantityPending: number;
  quantityReturned: number;
  quantityShipped: number;
  quantityUnallocated: number;
  returnableQuantity: number;
  returnedItemsPrice: PriceData;
  statusSummaryList: {
    numberOfIssues: number;
    status: string;
  }[];
  totalPrice: PriceData;
  updateable: boolean;
  url: string;
}

export interface CartEntryGroup {
  entries: CartEntry[];
  entryGroupNumber: number;
  entryGroups: CartEntryGroup[];
  erroneous: boolean;
  label: string;
  type: string;
}

export interface PaymentDetails {
  accountHolderName: string;
  billingAddress: Address;
  cardNumber: string;
  cardType: {
    code: string;
    name: string;
  };
  defaultPayment: true;
  expiryMonth: string;
  expiryYear: string;
  id: string;
  issueNumber: string;
  saved: boolean;
  startMonth: string;
  startYear: string;
  subscriptionId: string;
}

export interface Cart {
  appliedOrderPromotions: AppliedPromotion[];
  appliedProductPromotions: AppliedPromotion[];
  appliedVouchers: AppliedVoucher[];
  calculated: boolean;
  chinesePaymentDetails: {
    id: string;
    paymentProvider: string;
    paymentProviderLogo: string;
    paymentProviderName: string;
    serviceType: string;
  };
  code: string;
  costCenter: CostCenter & {
    unit: OrgUnit;
  };
  deliveryAddress: Address;
  deliveryCost: PriceData;
  deliveryItemsQuantity: number;
  deliveryMode: DeliveryMode;
  deliveryOrderGroups: {
    deliveryAddress: Address;
    entries: CartEntry[];
    quantity: number;
    totalPriceWithTax: PriceData;
  }[];
  deliveryTimeSlot: {
    code: string;
    name: string;
  };
  description: string;
  entries: CartEntry[];
  entryGroups: CartEntryGroup[];
  expirationTime: Date;
  guid: string;
  name: string;
  net: boolean;
  orderDiscounts: PriceData;
  PaymentDetails: PaymentDetails;
  paymentStatus: string;
  paymentType: {
    code: string;
    displayName: string;
  };
  pickupItemsQuantity: number;
  pickupOrderGroups: {
    deliveryPointOfService: CartEntry["deliveryPointOfService"];
    distance: number;
    entries: CartEntry[];
    quantity: number;
    totalPriceWithTax: PriceData;
  }[];
  potentialOrderPromotions: AppliedPromotion[];
  potentialProductPromotions: AppliedPromotion[];
  productDiscounts: PriceData;
  purchaseOrderNumber: string;
  saveTime: Date;
  savedBy: {
    name: string;
    uid: string;
  };
  site: string;
  store: string;
  subTotal: PriceData;
  taxInvoice: {
    recipient: string;
    recipientType: string;
    taxpayerID: string;
  };
  totalDiscounts: PriceData;
  totalItems: number;
  totalPrice: PriceData;
  totalPriceWithTax: PriceData;
  totalTax: PriceData;
  totalUnitCount: number;
  user: {
    name: string;
    uid: string;
  };
}

export interface LocationBaseData {
  isocode: string;
  name: string;
}

export interface RegionData extends LocationBaseData {
  countryIso: string;
  isocodeShort: string;
}

export interface Address {
  cellphone: string;
  city: LocationBaseData;
  cityDistrict: LocationBaseData;
  companyName: string;
  country: LocationBaseData;
  defaultAddress: boolean;
  district: string;
  email: string;
  firstName: string;
  formattedAddress: string;
  id: string;
  lastName: string;
  line1: string;
  line2: string;
  phone: string;
  postalCode: string;
  region: RegionData;
  shippingAddress: boolean;
  title: string;
  titleCode: string;
  town: string;
  visibleInAddressBook: boolean;
}

export interface OrgUnit {
  active: boolean;
  addresses: Address[];
  administrators: User[];
  approvalProcess: {
    code: string;
    name: string;
  };
  approvers: User[];
  costCenters: CostCenter[];
  customers: User[];
  managers: User[];
  name: string;
  uid: string;
}

export interface User {
  active?: boolean;
  approvers?: User[];
  currency: Currency;
  customerId: string;
  deactivationDate: Date;
  defaultAddress: Address;
  displayUid: string;
  email: string;
  emailLanguage: string;
  firstName: string;
  language: {
    active: boolean;
    isocode: string;
    name: string;
    nativeName: string;
  };
  lastName: string;
  mobileNumber: string;
  name: string;
  orgUnit: OrgUnit;
  roles: string[];
  selected: boolean;
  title: string;
  titleCode: string;
  uid: string;
}

export interface ProductListResponse {
  breadcrumbs: Breadcrumb[];
  categoryCode?: string;
  type: string;
  currentQuery: {
    query: {
      value: string;
    };
    url: string;
  };
  facets: FacetResponse[];
  freeTextSearch: string;
  keywordRedirectUrl: string;
  pagination: Pagination;
  products: Product[];
  sorts: SearchSort[];
  spellingSuggestion: {
    query: string;
    suggestion: string;
  };
}

export interface ProductDetailsResponse extends Product {
  baseOptions: ProductDetailsBaseOption[];
  bundleTemplates: {
    id: string;
    name: string;
    rootBundleTemplateName: string;
  }[];
  timedAccessPromotion: Promotion[];
}

export interface CatalogsResponse {
  catalogs: Catalog[];
}

export interface CartUpdateResponse {
  deliveryModeChanged: boolean;
  entry: CartEntry;
  quantity: number;
  quantityAdded: number;
  statusCode: string;
  statusMessage: string;
}
