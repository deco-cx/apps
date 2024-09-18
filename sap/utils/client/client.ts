import {
  CatalogsResponse,
  ProductDetailsResponse,
  ProductListResponse,
} from "../types.ts";

export interface API {
  "GET /products/search": {
    response: ProductListResponse;
  };
  "GET /catalogs?:fields": {
    response: CatalogsResponse;
  };
  "GET /orgProducts/:productCode": {
    response: ProductDetailsResponse;
    searchParams: {
      productCode: string;
      fields: string;
    };
  };
}
