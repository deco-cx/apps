import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Types for Purchase Quotations
export interface PurchaseQuotationInsert {
  buyerId: string;
  date: string;
  createdBy: string;
}

export interface DeliveryRequirement {
  requirementDate: string;
  requirementQuantity: number;
}

export interface PurchaseQuotationItemInsert {
  buildingId: number;
  productId: number;
  detailId?: number;
  trademarkId?: number;
  quantity: number;
  unitySymbol: string;
  notes?: string;
  deliveryRequirements: DeliveryRequirement[];
}

export interface PurchaseRequestItemDeliveryRequirementInsert {
  purchaseRequestId: number;
  purchaseRequestItemNumber: number;
  deliveryRequirementNumber: number;
}

export interface PurchaseQuotationItemSupplierInsert {
  supplierId: number;
}

export interface PurchaseQuotationNegotiationUpdate {
  supplierAnswerDate?: string;
  validity?: string;
  seller?: string;
  discount?: number;
  freightType?: "NONE" | "INCLUDED" | "PAID";
  freightTypeForGeneratedPurchaseOrder?: "PROPORTIONAL" | "TOTAL";
  freightPrice?: number;
  valueOtherExpenses?: number;
  applyIpiFreight?: boolean;
  internalNotes?: string;
  supplierNotes?: string;
  paymentTerms?: PaymentTerms[];
}

export interface PaymentTerms {
  description?: string;
  selected?: boolean;
  paymentTerms: PaymentTerm[];
}

export interface PaymentTerm {
  numberOfdays: number;
  percentage: number;
}

export interface PurchaseQuotationNegotiationItemUpdate {
  detailId?: number;
  trademarkId?: number;
  quotedQuantity: number;
  negotiatedQuantity: number;
  unitPrice: number;
  discount: number;
  discountPercentage: number;
  increasePercentage: number;
  ipiTaxPercentage: number;
  issTaxPercentage: number;
  icmsTaxPercentage: number;
  freightUnitPrice: number;
  reference?: string;
  selectedOption: boolean;
  internalNotes?: string;
  supplierNotes?: string;
  negotiationDeliveries?: PurchaseQuotationNegotiationDeliveryUpdate[];
}

export interface PurchaseQuotationNegotiationDeliveryUpdate {
  negotiationDeliveryNumber?: number;
  deliveryDate: string;
  deliveryQuantity: number;
}

export interface PaginatedResponseOfPurchaseQuotationWithNegotiation {
  resultSetMetadata: ResultSetMetadata;
  results: PurchaseQuotationWithNegotiation[];
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface PurchaseQuotationWithNegotiation {
  purchaseQuotationId: number;
  buyerId: string;
  consistent: boolean;
  status: string;
  quotationDate: string;
  responseDate: string;
  suppliers: QuotationSupplierDTO[];
}

export interface QuotationSupplierDTO {
  supplierId: number;
  supplierName: string;
  latestNegotiation: QuotationSupplierNegotiationDTO[];
}

export interface QuotationSupplierNegotiationDTO {
  negotiationId: number;
  responseDate: string;
  discount: number;
  shippingCosts: number;
  itemsShipping: number;
  ipiShippingFlag: string;
  ipiShippingCosts: number;
  otherCosts: number;
  totalItemsCosts: number;
  authorized: boolean;
}

export interface PurchaseQuotationComparisonMapReportPdfUrl {
  resultSetMetadata: ResultSetMetadata;
  results: UrlReportResults[];
}

export interface UrlReportResults {
  urlReport: string;
}

export interface ApiError {
  status: string;
  developerMessage: string;
  userMessage?: string[];
}

// Client interface
export interface PurchaseQuotationsClient {
  "POST /purchase-quotations": {
    response: void;
    body: PurchaseQuotationInsert;
  };
  "GET /purchase-quotations/all/negotiations": {
    response: PaginatedResponseOfPurchaseQuotationWithNegotiation;
    searchParams?: {
      quotationNumber?: number;
      supplierId?: number;
      buyerId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    };
  };
  "POST /purchase-quotations/:purchaseQuotationId/items": {
    response: void;
    body: PurchaseQuotationItemInsert;
  };
  "POST /purchase-quotations/:purchaseQuotationId/items/from-purchase-request":
    {
      response: void;
      body: PurchaseRequestItemDeliveryRequirementInsert;
    };
  "POST /purchase-quotations/:purchaseQuotationId/items/:purchaseQuotationItemNumber/suppliers":
    {
      response: void;
      body: PurchaseQuotationItemSupplierInsert;
    };
  "POST /purchase-quotations/:purchaseQuotationId/suppliers/:supplierId/negotiations":
    {
      response: void;
    };
  "PATCH /purchase-quotations/:purchaseQuotationId/suppliers/:supplierId/negotiations/latest/authorize":
    {
      response: void;
    };
  "PUT /purchase-quotations/:purchaseQuotationId/suppliers/:supplierId/negotiations/:negotiationNumber":
    {
      response: void;
      body: PurchaseQuotationNegotiationUpdate;
    };
  "PUT /purchase-quotations/:purchaseQuotationId/suppliers/:supplierId/negotiations/:negotiationNumber/items/:quotationItemNumber":
    {
      response: void;
      body: PurchaseQuotationNegotiationItemUpdate;
    };
  "GET /purchase-quotations/comparison-map/pdf": {
    response: PurchaseQuotationComparisonMapReportPdfUrl;
    searchParams: {
      purchaseQuotationId?: number;
      supplierId?: number;
      buyerId?: string;
      buildingId?: number;
      startDate?: string;
      endDate?: string;
      shortPrintFlag?: boolean;
      printGeneralDataFlag: boolean;
      printNumberRequestsOriginatedQuotationsFlag?: boolean;
      highlightHighestAndLowestPriceFlag?: boolean;
      highlightChosenSupplierFlag?: boolean;
      displayTradingAuthorizationHistoryFlag?: boolean;
      displaySupplierGroupPerPageFlag?: boolean;
      printQuotedPriceFlag?: boolean;
      printInternalObservationFlag?: boolean;
      showTheBestAndLastPriceConsideringDetailAndBrandFlag?: boolean;
    };
  };
}

export function createPurchaseQuotationsClient(state: State) {
  return createRestClient<PurchaseQuotationsClient>(state);
}
