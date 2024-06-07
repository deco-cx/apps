import { Catalogs, Product, Sort } from "./types.ts";

export interface API {
  /**
   * @docs https://fakestoreapi.com/docs#p-all
   * @docs https://fakestoreapi.com/docs#p-limit
   * @docs https://fakestoreapi.com/docs#p-sort
   */
  "GET /products": {
    response: Product[];
    searchParams: {
      limit?: number;
      sort?: Sort;
    };
  };

  "GET /catalogs?:fields": {
    response: {
      catalogs: Catalogs;
    };
    searchParams: {
      fields?: "BASIC" | "DEFAULT" | "FULL";
    };
  };
}
