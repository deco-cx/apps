import { WebPage as ProductWebPage } from "./types/productJSON.ts";
import { WebPage as GridProductsWebPage } from "./types/gridProductsJSON.ts";
import { CartResponse } from "./types/basketJSON.ts";
import { WebPage as SuggestionsWebPage } from "./types/suggestionsJSON.ts";
import { WebPage as AuctionWebPage } from "./types/auctionJSON.ts";
import { WebPage as AuctionDetailWebPage } from "./types/auctionDetailJSON.ts";
import { WebPage as ListBidsWebPage } from "./types/ListBidsJSON.ts";
import { ProductListResponse } from "./types/productList.ts";
import { CartOperation } from "./types/basket.ts";
import { Props as AddProductProps } from "../actions/cart/addItem.ts";
import { LoginResponse } from "./types/login.ts";
import { LinxError } from "./types/common.ts";

export interface API {
  "GET /*splat": {
    response:
      | ProductWebPage
      | GridProductsWebPage
      | SuggestionsWebPage
      | AuctionWebPage
      | AuctionDetailWebPage;
  };

  "GET /web-api/v1/Catalog/Products/:source/:id": {
    response: ProductListResponse;
    searchParams: {
      catalogID: number;
    };
  };

  "POST /web-api/v1/Profile/Account/Login": {
    response: LoginResponse;
    body: {
      Key: string;
      Password: string;
    };
  };

  "POST /web-api/v1/Shopping/Basket/Get": {
    response: CartResponse;
    body: {
      BasketID?: number;
    };
  };

  "POST /web-api/v1/Shopping/Basket/AddProduct": {
    response: CartResponse;
    body: AddProductProps;
  };

  "POST /web-api/v1/Shopping/Basket/AddCoupon": {
    response: CartResponse;
    body: {
      CouponCode: string;
      BasketID?: number;
    };
  };

  "POST /web-api/v1/Shopping/Basket/UpdateBasketItem": {
    response: CartResponse;
    body: {
      BasketItemID: number;
      Quantity: number;
    };
  };

  "POST /web-api/v1/Shopping/Basket/RemoveBasketItem": {
    response: CartResponse;
    body: {
      BasketItemID: number;
    };
  };

  "POST /Shopping/ProductAuction/AddBid": {
    response: CartOperation;
    body: {
      productAuctionID: number;
      Amount: number;
      IsListening: boolean;
    };
  };

  "GET /Shopping/ProductAuction/ListBids": {
    response: ListBidsWebPage;
    searchParams: {
      ProductAuctionID: number;
    };
  };
}

export interface LayerAPI {
  "POST /v1/Catalog/API.svc/web/SaveProductAuctionBid": {
    response: {
      IsValid: boolean;
      Errors: LinxError[];
      Warnings: string[];
    };
    body: {
      ProductAuctionID: number;
      Amount: number;
      // CustomerName: string;
      // CustomerState: string;
    };
  };
}
