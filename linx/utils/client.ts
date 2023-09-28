import { WebPage as ProductWebPage } from "./types/productJSON.ts";
import { WebPage as GridProductsWebPage } from "./types/gridProductsJSON.ts";
import { WebPage as BasketWebPage } from "./types/basketJSON.ts";
import { WebPage as SuggestionsWebPage } from "./types/suggestionsJSON.ts";
import { ProductListResponse } from "./types/productList.ts";
import { CartOperation } from "./types/basket.ts";

export interface API {
  "GET /*splat": {
    response:
      | ProductWebPage
      | GridProductsWebPage
      | BasketWebPage
      | SuggestionsWebPage;
  };

  "GET /web-api/v1/Catalog/Products/:source/:id": {
    response: ProductListResponse;
    searchParams: {
      catalogID: number;
    };
  };

  "POST /carrinho/adicionar-produto": {
    response: CartOperation;
    body: {
      Products: Array<{ ProductID: string; SkuID: string; Quantity: number }>;
    };
  };

  "POST /carrinho/alterar-quantidade": {
    response: CartOperation;
    body: { BasketItemID: number; Quantity: number };
  };

  "POST /carrinho/remover-produto": {
    response: CartOperation;
    body: { BasketItemID: number };
  };

  "POST /carrinho/adicionar-cupom": {
    response: CartOperation;
    body: { CouponCode: string };
  };
}
