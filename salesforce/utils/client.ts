import {
  Basket,
  BasketItems,
  CategorySalesforce,
  DynamicAttributes,
  ProductBaseSalesforce,
  ProductSearch,
  Sort,
  Suggestions,
  TokenBaseSalesforce,
} from "./types.ts";

export interface SalesforceClient {
  "POST /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId/items":
    {
      searchParams: {
        siteId?: string;
        refine?: string;
        q?: string;
        sort?: string;
        limit?: number;
      };
      response: Basket;
      body: BasketItems[];
      headers: {
        Authorization: string;
      };
    };
  "PATCH /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId/items/:itemId":
    {
      searchParams: {
        siteId?: string;
      };
      response: Basket;
      body: {
        quantity?: number;
        c_attributes?: DynamicAttributes;
      };
      headers: {
        Authorization: string;
      };
    };
  "POST /shopper/auth/v1/organizations/:organizationId/oauth2/token": {
    response: TokenBaseSalesforce;
    body: URLSearchParams;
    headers: {
      Authorization: string;
      "Content-Type": "application/x-www-form-urlencoded";
    };
  };
  "DELETE /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId/items/:itemId":
    {
      response: Basket;
    };
  headers: {
    Authorization: string;
  };

  "GET /search/shopper-search/v1/organizations/:organizationId/product-search":
    {
      response: ProductSearch;
      searchParams: {
        siteId: string;
        q?: string;
        refine?: Array<string>;
        sort?: Sort;
        currency?: string;
        locale?: string;
        expand?: string[];
        offset?: number;
        limit?: number;
      };
      headers: {
        Authorization: string;
      };
    };
  "GET /product/shopper-products/v1/organizations/:organizationId/products": {
    response: ProductSearch;
    searchParams: {
      select?: string;
      ids?: string;
      inventoryIds?: string;
      currency?: string;
      expand?: string[];
      locale?: string;
      perPricebook?: boolean;
      siteId: string;
    };
    headers: {
      Authorization: string;
    };
  };
  "POST /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId/coupons":
    {
      response: Basket;
      body: {
        code: string;
        valid: boolean;
        c_attributes?: DynamicAttributes;
      };
      headers: {
        Authorization: string;
      };
    };

  "DELETE /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId/coupons/:couponItemId":
    {
      response: Basket;
      headers: {
        Authorization: string;
      };
    };

  "POST /checkout/shopper-baskets/v1/organizations/:organizationId/baskets": {
    searchParams: {
      siteId?: string;
    };
    response: Basket;
    body: {
      c_attributes?: DynamicAttributes;
    };
    headers: {
      Authorization: string;
    };
  };

  "GET /search/shopper-search/v1/organizations/:organizationId/search-suggestions":
    {
      response: Suggestions;
      searchParams: {
        siteId: string;
        q?: string;
        currency?: string;
        locale?: string;
        limit?: number;
      };
      headers: {
        Authorization: string;
      };
    };

  "GET /product/shopper-products/v1/organizations/:organizationId/categories/:id":
    {
      response: CategorySalesforce;
      searchParams: {
        siteId: string;
        locale?: string;
        levels?: number;
      };
      headers: {
        Authorization: string;
      };
    };
  "GET /product/shopper-products/v1/organizations/:organizationId/products/:id":
    {
      response: ProductBaseSalesforce;
      searchParams: {
        select?: string;
        inventoryIds?: string;
        currency?: string;
        expand?: string[];
        locale?: string;
        perPricebook?: boolean;
        siteId: string;
        allImages?: boolean;
      };
      headers: {
        Authorization: string;
      };
    };
  "GET /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId":
    {
      searchParams: {
        siteId: string;
        locale?: string;
      };
      response: Basket;

      headers: {
        Authorization: string;
      };
    };
}
