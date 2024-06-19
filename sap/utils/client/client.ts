import {
  CatalogsResponse,
  ProductListResponse,
  SearchResponse,
} from "./types.ts";
import { Props as SearchProps } from "../../loaders/search.ts";
import { Props as ProductListingPageProps } from "../../loaders/product/productListingPage.ts";
import { Props as CatalogsProps } from "../../loaders/categories/tree.ts";

export interface API {
  "GET /products/search": {
    response: SearchResponse;
    searchParams: SearchProps;
  };

  "GET /categories/:categoryId/products": {
    response: ProductListResponse;
    searchParams: ProductListingPageProps;
  };

  "GET /catalogs?:fields": {
    response: CatalogsResponse;
    searchParams: CatalogsProps;
  };
}
