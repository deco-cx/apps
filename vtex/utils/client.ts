import {
  Brand,
  Category,
  CreateNewDocument,
  FacetSearchResult,
  InstallmentOption,
  LegacyFacets,
  LegacyProduct,
  LegacySort,
  OrderForm,
  PageType,
  PortalSuggestion,
  ProductSearchResult,
  SelectableGifts,
  SimulationItem,
  SimulationOrderForm,
  SPEvent,
  Suggestion,
} from "./types.ts";

export interface VTEXCommerceStable {
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
  "POST /api/dataentities/:acronym/documents": {
    response: CreateNewDocument;
    body: Record<string, unknown>;
  };
  "GET /api/catalog_system/pub/brand/list": {
    response: Brand[];
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
