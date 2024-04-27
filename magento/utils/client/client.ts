import {
  Categoria,
  FieldsFilter,
  MagentoProduct,
} from "./types.ts";

interface searchParams {
  [key: string]: string | number | FieldsFilter;
}

export interface API {
  /** @docs https://developer.adobe.com/commerce/webapi/rest/quick-reference/ */
  "POST /V1/guest-carts": {
    response: string;
  };

  "GET /rest/granado/V1/products-render-info": {
    response: MagentoProduct[];
    searchParams: searchParams;
  };

  "GET /rest/granado/V1/products/:sku": {
    response: MagentoProduct;
    searchParams: searchParams;
  };

  "GET /rest/granado/V1/products": {
    response: MagentoProduct[];
    searchParams: searchParams;
  };

  "GET /rest/granado/V1/categories/:categoryId": {
    response: Categoria;
    searchParams: {
      categoryId: string;
      fields?: string;
    };
  };
}
