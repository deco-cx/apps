import {
  Userorderdetails,
  Userorderslist,
} from "./openapi/orders.openapi.gen.ts";
import {
  AuthResponse,
  Brand,
  Category,
  CreateNewDocument,
  FacetSearchResult,
  InstallmentOption,
  LegacyFacets,
  LegacyProduct,
  LegacySort,
  OrderForm,
  OrderFormOrder,
  PageType,
  PortalSuggestion,
  Product,
  ProductSearchResult,
  SelectableGifts,
  SimulationBehavior,
  SimulationItem,
  SimulationOrderForm,
  SPEvent,
  StartAuthentication,
  Suggestion,
} from "./types.ts";

/**
 * Context parameters for the Intelligent Search API v1.
 *
 * Unlike the legacy API, v1 no longer reads the `vtex_segment` cookie: locale,
 * sales channel, region and marketing context must be sent explicitly as query
 * parameters.
 *
 * @see https://developers.vtex.com/updates/release-notes/2026-07-08-new-intelligent-search-api-v1
 */
export interface IntelligentSearchContext {
  /** @description BCP 47 language code, e.g. pt-BR */
  locale?: string;
  /** @description Sales channel (trade policy) ID */
  sc?: string;
  /** @description Region ID for regionalized results */
  regionId?: string;
  /** @description Three-letter country code (ISO 3166 ALPHA-3), e.g. BRA */
  country?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmiCampaign?: string;
  campaigns?: string;
  priceTables?: string;
}

export interface VTEXCommerceStable {
  "GET /api/vtexid/pub/authentication/start": {
    searchParams: {
      scope?: string;
      locale?: string;
      appStart: boolean;
      callbackUrl?: string;
      returnUrl?: string;
    };
    response: StartAuthentication;
  };
  "POST /api/vtexid/refreshtoken/webstore": {
    response: {
      status: string;
      userId: string;
      refreshAfter: string;
    };
    body: {
      fingerprint?: string;
    };
  };
  "POST /api/vtexid/pub/authentication/classic/validate": {
    body: URLSearchParams;
    response: AuthResponse;
  };
  "POST /api/vtexid/pub/authentication/accesskey/validate": {
    body: URLSearchParams;
    response: AuthResponse;
  };
  "POST /api/vtexid/pub/authentication/classic/setpassword": {
    searchParams: { scope?: string; locale?: string };
    body: URLSearchParams;
    response: AuthResponse;
  };
  "POST /api/vtexid/pub/authentication/accesskey/send": {
    searchParams: { deliveryMethod: "email" };
    body: FormData;
    response: Record<string, string>;
  };
  "POST /api/checkout/pub/orders/:orderId/user-cancel-request": {
    response: unknown;
    body: {
      reason: string;
    };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/messages/clear": {
    // deno-lint-ignore no-explicit-any
    body: Record<any, never>;
    response: OrderForm;
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/selectable-gifts/:giftId": {
    body: SelectableGifts & {
      expectedOrderFormSections: string[];
    };
    response: OrderForm;
  };
  "POST /no-cache/Newsletter.aspx": { body: FormData };
  "POST /no-cache/AviseMe.aspx": { body: FormData };
  "GET /api/catalog_system/pub/portal/pagetype/:term": { response: PageType };
  "GET /buscaautocomplete": {
    response: PortalSuggestion;
    searchParams: {
      maxRows: number;
      productNameContains?: string;
      suggestionsStack: string;
    };
  };
  "GET /api/catalog_system/pub/products/crossselling/:type/:productId": {
    response: LegacyProduct[];
    searchParams: {
      utm_source?: string;
      utm_campaign?: string;
      utmi_campaign?: string;
    };
  };
  "GET /api/catalog_system/pub/facets/search/:term": {
    response: LegacyFacets;
    searchParams: {
      utm_source?: string;
      utm_campaign?: string;
      utmi_campaign?: string;
      map?: string;
      _from?: number;
      _to?: number;
      fq?: string[];
      ft?: string;
      O?: LegacySort;
    };
  };
  "GET /api/catalog_system/pub/products/search/:term?": {
    response: LegacyProduct[];
    searchParams: {
      utm_source?: string;
      utm_campaign?: string;
      utmi_campaign?: string;
      map?: string;
      _from?: number;
      _to?: number;
      fq?: string[];
      ft?: string;
      O?: LegacySort;
    };
  };
  "GET /api/catalog_system/pub/products/search/:slug/p": {
    response: LegacyProduct[];
    searchParams: {
      utm_source?: string;
      utm_campaign?: string;
      utmi_campaign?: string;
    };
  };
  "GET /api/catalog_system/pub/category/tree/:level": { response: Category[] };
  // Legacy Intelligent Search endpoints. Kept alongside the v1 routes so the
  // `intelligentSearchV1` app flag can fall back to them.
  "GET /api/io/_v/api/intelligent-search/search_suggestions": {
    response: Suggestion;
    searchParams: { locale: string; query: string };
  };
  "GET /api/io/_v/api/intelligent-search/top_searches": {
    response: Suggestion;
    searchParams: { locale: string };
  };
  "GET /api/io/_v/api/intelligent-search/product_search/*facets": {
    response: ProductSearchResult;
    searchParams: {
      page: number;
      count: number;
      query?: string;
      sort?: string;
      fuzzy?: string;
      locale?: string;
      hideUnavailableItems: boolean;
    };
  };
  "GET /api/io/_v/api/intelligent-search/facets/*facets": {
    response: FacetSearchResult;
    searchParams: {
      page: number;
      count: number;
      query?: string;
      sort?: string;
      fuzzy?: string;
      locale?: string;
      hideUnavailableItems: boolean;
    };
  };
  "GET /api/intelligent-search/v1/search-suggestions": {
    response: Suggestion;
    searchParams: { locale: string; query: string };
  };
  "GET /api/intelligent-search/v1/top-searches": {
    response: Suggestion;
    searchParams: { locale: string };
  };
  "GET /api/intelligent-search/v1/product-search/*facets": {
    response: ProductSearchResult;
    searchParams:
      & {
        page: number;
        count: number;
        query?: string;
        sort?: string;
        fuzzy?: string;
        hideUnavailableItems: boolean;
      }
      & IntelligentSearchContext;
  };
  "GET /api/intelligent-search/v1/facets/*facets": {
    response: FacetSearchResult;
    searchParams:
      & {
        page: number;
        count: number;
        query?: string;
        sort?: string;
        fuzzy?: string;
        hideUnavailableItems: boolean;
      }
      & IntelligentSearchContext;
  };
  // Dedicated single-product lookup introduced by the Intelligent Search API v1,
  // replacing the `product_search` + `product:`/`sku:` pipeline for PDPs.
  "GET /api/intelligent-search/v1/products": {
    response: Product;
    searchParams:
      & {
        /** @description Identifier value to look up, interpreted per `field`. */
        value: string;
        /** @description Which identifier `value` represents. Defaults to `id`. */
        field?: "id" | "slug" | "ean" | "sku" | "reference";
        hideUnavailableItems?: boolean;
        simulationBehavior?: SimulationBehavior;
      }
      & IntelligentSearchContext;
  };

  "GET /api/checkout/changeToAnonymousUser/:orderFormId": {
    response: OrderForm;
    searchParams: { sc?: string };
  };
  "POST /api/checkout/pub/orderForms/simulation": {
    response: SimulationOrderForm;
    body: {
      items: SimulationItem[];
      postalCode?: string;
      country: string;
    };
  };
  "POST /api/checkout/pub/orderForm": {
    searchParams: { sc?: string };
    response: OrderForm;
  };
  "GET /api/checkout/pub/orderForm/:orderFormId/installments": {
    response: InstallmentOption;
    searchParams: { paymentSystem: number; sc?: string };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/profile": {
    response: OrderForm;
    searchParams: { sc?: string };
  };
  "PATCH /api/checkout/pub/orderForm/:orderFormId/profile": {
    response: OrderForm;
    body: { ignoreProfileData: boolean };
    searchParams: { sc?: string };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/coupons": {
    response: OrderForm;
    body: { text: string };
    searchParams: { sc?: string };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/attachments/:attachment": {
    searchParams: { sc?: string };
    response: OrderForm;
    body: {
      expectedOrderFormSections: string[];
      [x: string]: unknown;
    };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/items": {
    response: OrderForm;
    searchParams: {
      sc?: string;
      allowedOutdatedData: "paymentData"[];
    };
    body: {
      orderItems: Array<{
        quantity: number;
        seller: string;
        id: string;
        index?: number;
        price?: number;
      }>;
    };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/items/update": {
    response: OrderForm;
    body: {
      noSplitItem?: boolean;
      orderItems: Array<{
        quantity: number;
        index: number;
      }>;
    };
    searchParams: {
      sc?: string;
      allowedOutdatedData: "paymentData"[];
    };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/items/removeAll": {
    response: OrderForm;
    searchParams: { sc?: string };
  };
  "PUT /api/checkout/pub/orderForm/:orderFormId/items/:index/price": {
    searchParams: { sc?: string };
    response: OrderForm;
    body: { price: number };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/items/:index/attachments/:attachment":
    {
      searchParams: { sc?: string };
      response: OrderForm;
      body: {
        content: Record<string, string>;
        noSplitItem: boolean;
        expectedOrderFormSections: string[];
      };
    };
  "DELETE /api/checkout/pub/orderForm/:orderFormId/items/:index/attachments/:attachment":
    {
      searchParams: { sc?: string };
      response: OrderForm;
      body: {
        content: Record<string, string>;
        noSplitItem: boolean;
        expectedOrderFormSections: string[];
      };
    };
  "POST /api/checkout/pub/orderForm/:orderFormId/items/:index/offerings": {
    searchParams: { sc?: string };
    response: OrderForm;
    body: {
      expectedOrderFormSections: string[];
      id: number;
      info: null;
    };
  };
  "POST /api/checkout/pub/orderForm/:orderFormId/items/:index/offerings/:id/remove":
    {
      searchParams: { sc?: string };
      response: OrderForm;
      body: {
        expectedOrderFormSections: string[];
      };
    };
  "POST /api/dataentities/:acronym/documents": {
    searchParams: {
      _schema?: string;
    };
    response: CreateNewDocument;
    body: Record<string, unknown>;
  };
  "GET /api/catalog_system/pub/brand/list": {
    response: Brand[];
  };
  "GET /api/oms/user/orders": {
    response: Userorderslist;
  };
  "GET /api/oms/user/orders/:orderId": {
    response: Userorderdetails;
  };
  "GET /api/checkout/pub/orders/:orderId": {
    response: OrderFormOrder;
  };
  "GET /api/checkout/pub/orders/order-group/:orderGroupId": {
    response: OrderFormOrder[];
  };
}

export interface SP {
  "POST /event-api/v1/:account/event": {
    response: void;
    body: SPEvent & {
      agent: string;
      anonymous: string;
      session: string;
    };
  };
}
