import {
  Item,
  OrderForm,
  ProductGroup,
  ProductPrice,
  ProductSearchResult,
  RelatedItemTag,
  SEO,
  ShippingMethod,
  Sort,
  TagsSearchParams,
} from "./types.ts";

export interface API {
  /** @docs https://developers.vnda.com.br/reference/get-api-v2-products-id */
  "GET /api/v2/products/:id": {
    response: ProductGroup;
    searchParams: { include_images: boolean };
  };

  /** @docs https://developers.vnda.com.br/reference/get-api-v2-products-product_id-price */
  "GET /api/v2/products/:productId/price": {
    response: ProductPrice;
    searchParams: { coupon_codes?: string[] };
  };

  /** @docs https://developers.vnda.com.br/reference/get-api-v2-banners */
  "GET /api/v2/banners": {
    searchParams: {
      only_valid: boolean;
      tag: "listagem-banner-principal";
    };
  };

  /** @docs https://developers.vnda.com.br/reference/get-api-v2-tags-name */
  "GET /api/v2/tags/:name": {
    response: RelatedItemTag;
  };

  /** @docs https://developers.vnda.com.br/reference/get-api-v2-tags */
  "GET /api/v2/tags": {
    response: RelatedItemTag[];
    searchParams: TagsSearchParams;
  };

  "GET /api/v2/seo_data": {
    response: SEO[];
    searchParams: {
      resource_type: "Product" | "Page";
      resource_id: string | number;
      type: "category";
    } | {
      resource_type: "Tag";
      code: string;
      type: "category";
    };
  };

  /** @docs https://developers.vnda.com.br/reference/get-api-v2-products-search */
  "GET /api/v2/products/search": {
    response: Omit<ProductSearchResult, "pagination">;
    searchParams: {
      term?: string | undefined;
      page?: number;
      "tags[]"?: string[];
      sort?: Sort;
      per_page?: number;
      wildcard?: boolean;
      type_tags_operator?: string;
    } & { [x: string]: unknown | unknown[] };
  };

  /** @docs https://developers.vnda.com.br/reference/get-api-v2-carts-id */
  "GET /api/v2/carts/:cartId": {
    response: OrderForm;
  };

  /** @docs https://developers.vnda.com.br/reference/post-api-v2-carts */
  "POST /api/v2/carts": {
    response: OrderForm;
  };

  /** @docs https://developers.vnda.com.br/reference/get-api-v2-carts-id */
  "PATCH /api/v2/carts/:cartId": {
    response: OrderForm;
    body: {
      agent?: string;
      zip?: string;
      client_id?: number;
      coupon_code?: string;
      rebate_token?: string;
    };
  };

  /** @docs https://developers.vnda.com.br/reference/post-api-v2-carts-cart_id-items */
  "POST /api/v2/carts/:cartId/items": {
    response: Item;
    body: {
      sku: string;
      quantity: number;
      place_id?: number;
      store_coupon_code?: string;
      customizations?: Record<string, unknown>;
      extra?: Record<string, unknown>;
    };
  };

  /** @docs https://developers.vnda.com.br/reference/patch-api-v2-carts-cart_id-items-id */
  "PATCH /api/v2/carts/:cartId/items/:itemId": {
    response: Item;
    body: {
      sku?: string;
      quantity: number;
      place_id?: number;
      store_coupon_code?: string;
      customizations?: Record<string, unknown>;
      extra?: Record<string, unknown>;
    };
  };

  /** @docs https://developers.vnda.com.br/reference/delete-api-v2-carts-cart_id-items-id */
  "DELETE /api/v2/carts/:cartId/items/:itemId": undefined;

  /** @docs https://developers.vnda.com.br/reference/get-api-v2-variants-variant_sku-shipping_methods */
  "GET /api/v2/variants/:sku/shipping_methods": {
    response: ShippingMethod[];
    searchParams: { quantity: number; zip: string };
  };
}
