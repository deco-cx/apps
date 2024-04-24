import { ProductSearchResult, SearchCriteria } from "./types.ts";

export interface API {
  /** @docs https://developer.adobe.com/commerce/webapi/rest/quick-reference/ */
  "POST /V1/guest-carts": {
    response: string;
  };

  "GET /V1/products-render-info": {
    response: ProductSearchResult;
    searchParams: {
      storeId: number;
      currencyCode: string;
      searchCriteria: SearchCriteria;
    };
  };
}
