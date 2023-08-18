import {
  CountryCode,
  CurrencyCode,
  OrderCancelReason,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "./enums.ts";

type Attribute = {
  key: string;
  value?: string;
};

type MailingAddress = {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  countryCodeV2?: CountryCode;
  firstName?: string;
  formattedArea?: string;
  id: string;
  lastName?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  phone?: string;
  province?: string;
  provinceCode?: string;
  zip?: string;
};

type MoneyV2 = {
  amount: number;
  currencyCode: CurrencyCode;
};

type AppliedGiftCard = {
  amountUsed: MoneyV2;
  balance: MoneyV2;
  id: string;
  lastCharacters: string;
  presentmentAmountUsed: MoneyV2;
};

type ShippingRate = {
  handle: string;
  price: MoneyV2;
  title: string;
};

type AvailableShippingRates = {
  ready: boolean;
  shippingRates?: ShippingRate[];
};

type CheckoutBuyerIdentity = {
  countryCode: CountryCode;
};

type Order = {
  billingAddress?: MailingAddress;
  cancelReason?: OrderCancelReason;
  canceledAt?: Date;
  currencyCode: CurrencyCode;
  currentSubtotalPrice: MoneyV2;
  currentTotalDuties?: MoneyV2;
  currentTotalPrice: MoneyV2;
  currentTotalTax: MoneyV2;
  customAttributes: Attribute[];
  customerLocale?: string;
  customerUrl?: string;
  edited: boolean;
  email?: string;
  financialStatus?: OrderFinancialStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  id: string;
  name: string;
  orderNumber: number;
  originalTotalDuties?: MoneyV2;
  originalTotalPrice: MoneyV2;
  phone?: string;
  processedAt: Date;
  shippingAddress?: MailingAddress;
};

type Checkout = {
  appliedGiftCards: AppliedGiftCard[];
  availableShippingRates?: AvailableShippingRates;
  buyerIdentity: CheckoutBuyerIdentity;
  completedAt?: Date;
  createdAt: Date;
  currencyCode: CurrencyCode;
  customAttributes: Attribute[];
  email?: string;
  id: string;
  lineItemsSubtotalPrice: MoneyV2;
  note: string;
  order: Order;
  orderStatusUrl: string;
  paymentDue: MoneyV2;
  ready: boolean;
  requireShipping: boolean;
  shippingAddress: MailingAddress;
};

type Customer = {
  acceptsMarketing: boolean;
  createdAt: Date;
  defaultAddress: MailingAddress;
  displayName: string;
  email: string;
  firstName: string;
  id: string;
  checkout: Checkout;
};

type CartBuyerIdentity = {
  countryCode: string;
  customer: Customer;
};

export type OldCart = {
  attribute?: Attribute;
  attributes?: Attribute[];
  buyerIdentity?: CartBuyerIdentity;
  id: string;
};

export interface Money {
  amount: number;
  currencyCode: string;
}

export interface Image {
  url: string;
  width: number;
  height: number;
  altText: string;
}

export interface CartData {
  id: string;
  lines?: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        product: {
          title: string;
        };
        image: Image;
        price: Money;
      };
      cost: {
        totalAmount: Money;
        subtotalAmount: Money;
        amountPerQuantity: Money;
        compareAtAmountPerQuantity: Money;
      };
    }[];
  };
  checkoutUrl?: string;
  cost?: {
    subtotalAmount: Money;
    totalAmount: Money;
    checkoutChargeAmount: Money;
  };
  discountCodes?: {
    code: string;
    applicable: boolean;
  }[];
  discountAllocations?: {
    discountedAmount: Money;
  };
}

export interface Cart {
  cart: CartData;
}

export interface Product {
  availableForSale: boolean;
  createdAt: string;
  description: string;
  descriptionHtml: string;
  featuredImage: Image;
  handle: string;
  id: string;
  images: Images;
  isGiftCard: boolean;
  media: Media;
  onlineStoreUrl: null;
  options: Option[];
  priceRange: PriceRange;
  productType: string;
  publishedAt: string;
  requiresSellingPlan: boolean;
  seo: SEO;
  tags: string[];
  title: string;
  totalInventory: number;
  updatedAt: string;
  variants: Variants;
  vendor: string;
}

export interface Images {
  nodes: Image[];
}

export interface Media {
  nodes: Media[];
}

export interface Media {
  alt: string;
  previewImage: Image;
  mediaContentType: string;
}

export interface Option {
  name: string;
  values: string[];
}

export interface PriceRange {
  minVariantPrice: Price;
  maxVariantPrice: Price;
}

export interface Price {
  amount: string;
  currencyCode: string;
}

export interface SEO {
  title: string;
  description: string;
}

export interface Variants {
  nodes: Variant[];
}

export interface Variant {
  availableForSale: boolean;
  barcode: string;
  compareAtPrice: Price | null;
  currentlyNotInStock: boolean;
  id: string;
  image: Image;
  price: Price;
  quantityAvailable: number;
  requiresShipping: boolean;
  selectedOptions: SelectedOption[];
  sku: string;
  title: string;
  unitPrice: null;
  unitPriceMeasurement: UnitPriceMeasurement;
  weight: number;
  weightUnit: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface UnitPriceMeasurement {
  measuredType: null;
  quantityValue: number;
  referenceUnit: null;
  quantityUnit: null;
}
