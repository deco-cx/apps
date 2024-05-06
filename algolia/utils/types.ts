import { SearchResponse } from "https://esm.sh/@algolia/client-search@4.23.3";
import { Props } from "../loaders/product/listingPageV2.ts";

// deno-lint-ignore no-explicit-any
export type AlgoliaProduct = any;

export type FacetFilters = [string, string[]][];

export type PageInfo = {
  nextPage: string | undefined;
  previousPage: string | undefined;
  records: number;
  recordPerPage: number;
  currentPage: number;
};

export interface AlgoliaV2 {
  results: SearchResponse<AlgoliaProduct>[];
  facetFilters: FacetFilters;
  startingPage?: number;
  props: Props;
}
