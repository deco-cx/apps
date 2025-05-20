import {
  CartFromAPI,
  CustomerAddress,
  FieldsFilter,
  LiveloPoints,
  MagentoCardPrices,
  MagentoCategory,
  MagentoProduct,
  NewsletterData,
  ReviewsAmastyAPI,
  SetShipping,
  ShippingMethod,
  SubmitReviewAmastyAPI,
  SubmitReviewAmastyBody,
  Success,
  User,
  WishListReponse,
} from "./types.ts";

interface searchParams {
  [key: string]: string | number | undefined | FieldsFilter;
  currencyCode?: string;
  storeId?: number;
  fields?: string;
}

export interface API {
  /** @docs https://adobe-commerce.redoc.ly/2.4.7-guest/tag/products-render-info */
  "GET /rest/:site/V1/products-render-info": {
    response: {
      items: MagentoProduct[];
    };
    searchParams: searchParams;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/productssku#operation/GetV1ProductsSku */
  "GET /rest/:site/V1/products/:sku": {
    response: MagentoProduct;
    searchParams: searchParams;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/products#operation/GetV1Products */
  "GET /rest/:site/V1/products": {
    response: {
      items: MagentoProduct[];
    };
    searchParams: searchParams;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/categoriescategoryId#operation/GetV1CategoriesCategoryId */
  "GET /rest/:site/V1/categories/:categoryId": {
    response: MagentoCategory;
    searchParams: {
      categoryId: string;
      fields?: string;
    };
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/guest-carts#operation/PostV1Guestcarts */
  "POST /rest/:site/V1/guest-carts": {
    response: string;
  };
  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/cartscartId#operation/GetV1CartsCartId */
  "GET /rest/:site/V1/carts/:cartId": {
    response: CartFromAPI;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/carts#operation/GetV1CartsMine */
  "GET /rest/:site/V1/carts/mine": {
    response: CartFromAPI;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/guest-cartscartId#operation/GetV1GuestcartsCartId */
  "GET /rest/:site/V1/guest-carts/:cartId": {
    response: CartFromAPI;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/cartscartIdtotals/ */
  "GET /rest/:site/V1/carts/:cartId/totals": {
    response: MagentoCardPrices;
    searchParams: {
      fields?: string;
    };
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/cartsquoteIditems#operation/PostV1CartsQuoteIdItems */
  "POST /rest/:site/V1/carts/:quoteId/items": {
    response: string;
    body: {
      cartItem: {
        qty: number;
        quote_id: string;
        sku: string;
      };
    };
  };

  "GET /rest/:site/V1/products/": {
    response: {
      items: {
        [key: string]: unknown;
        name: string;
        url_key: string;
        sku: string;
        media_gallery_entries: {
          file: string;
          types: string;
          disabled: boolean;
          label: string;
          position: number;
        }[];
        custom_attributes:
          | {
            attribute_code: string;
            value: string;
          }[]
          | {
            [key: string | number]: {
              attribute_code: string;
              value: string;
            };
          };
      }[];
    };
    searchParams: {
      "searchCriteria[filter_groups][0][filters][0][field]": string;
      "searchCriteria[filter_groups][0][filters][0][value]": string;
      "searchCriteria[filter_groups][0][filters][0][condition_type]": string;
      fields?: string;
      "searchCriteria[pageSize]": number;
    };
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/cartsquoteIditems#operation/PostV1CartsQuoteIdItems */
  "PUT /rest/:site/V1/carts/:cartId/coupons/:couponCode": {
    response: boolean;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/cartsquoteIditems#operation/PostV1CartsQuoteIdItems */
  "DELETE /rest/:site/V1/carts/:cartId/coupons": {
    response: boolean;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/cartscartIditemsitemId#operation/PutV1CartsCartIdItemsItemId */
  "PUT /rest/:site/V1/carts/:cartId/items/:itemId": {
    response: string;
    body: {
      cartItem: {
        qty: number;
        quote_id: string;
        sku: string;
      };
    };
  };
  "POST /rest/:site/V1/carts/:cartId/items": {
    response: string;
    body: {
      cartItem: {
        qty: number;
        quote_id: string;
        sku: string;
      };
    };
  };
  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/cartscartIditemsitemId#operation/DeleteV1CartsCartIdItemsItemId */
  "DELETE /rest/:site/V1/carts/:cartId/items/:itemId": {
    response: boolean;
  };
  /** @docs https://adobe-commerce.redoc.ly/2.4.7-guest/tag/guest-cartscartIdestimate-shipping-methods */
  "POST /rest/:site/V1/carts/:cartId/estimate-shipping-methods": {
    response: ShippingMethod[];
    body: {
      address: CustomerAddress;
    };
  };

  "GET /:site/customer/section/load": {
    response: User;
    searchParams: {
      sections: string;
    };
  };

  "POST /rest/:site/V1/newsletter/subscribed": {
    response: NewsletterData;
    body: {
      email: string;
      store_id: number;
    };
  };

  "POST /:site/rest/:site2/V1/digitalhub/set-shipping-to-quote": {
    response: [];
    body: SetShipping;
  };

  "POST /:site/wishlist/index/add/": {
    response: WishListReponse;
    body: FormData;
  };

  "POST /:site/wishlist/index/remove/": {
    response: Success;
    body: FormData;
  };

  "GET /rest/:reviewUrl/:productId": {
    response: ReviewsAmastyAPI;
    searchParams: {
      reviewUrl: string;
      productId: string;
    };
  };

  "POST /rest/:reviewUrl": {
    response: SubmitReviewAmastyAPI;
    searchParams: {
      reviewUrl: string;
    };
    body: SubmitReviewAmastyBody;
  };

  "POST /:site/checkout/cart/add/uenc/:uenc/product/:productId": {
    response: unknown;
    body: {
      product: string;
      uenc?: string;
      form_key: string;
      qty: number;
    };
  };

  "GET /rest/:liveloUrl/:productId": {
    searchParams: {
      liveloUrl: string;
      productId: string;
    };
    response: LiveloPoints;
  };

  "GET /rest/:liveloUrl/:cartId": {
    searchParams: {
      liveloUrl: string;
      cartId: string;
    };
    response: LiveloPoints;
  };
}
