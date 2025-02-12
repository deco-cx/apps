import {
  CatalogsResponse,
  ProductDetailsResponse,
  ProductListResponse,
} from "../types.ts";

export interface API {
  "GET /users/anonymous/eluxproducts/search": {
    response: ProductListResponse;
  };
  "GET /catalogs?:fields": {
    response: CatalogsResponse;
  };
  "GET /products/:productCode": {
    response: ProductDetailsResponse;
    searchParams: {
      productCode: string;
      fields: string;
    };
  };
}
