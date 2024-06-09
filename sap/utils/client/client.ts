import { Catalogs, FieldsList, SearchResponse, Sort } from "./types.ts";

export interface API {
  "GET /products/search": {
    response: SearchResponse;
    searchParams: {
      currentPage?: number;
      fields?: FieldsList;
      pageSize?: number;
      sort?: Sort;
    };
  };

  "GET /catalogs?:fields": {
    response: {
      catalogs: Catalogs;
    };
    searchParams: {
      fields?: FieldsList;
    };
  };
}
