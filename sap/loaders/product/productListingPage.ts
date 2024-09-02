import { ProductListingPage } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import type { AppContext } from "../../mod.ts";
import { FieldsList, ProductListResponse } from "../../utils/types.ts";
import {
  convertBreadcrumb,
  convertFacetsToFilters,
  convertProductData,
  getPreviousNextPagination,
} from "../../utils/transform.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";

export interface Props {
  /**
   * @description The current result page requested.
   * @hide true
   * @default 0
   */
  currentPage?: number;
  /**
   * @title Fields
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   * @default DEFAULT
   */
  fields?: FieldsList;
  /**
   * @title Items per page
   * @description The number of results returned per page.
   * @default 12
   */
  pageSize?: number;
  /**
   * @title Search term
   * @description The free text search term.
   */
  term?: RequestURLParam;
}

/**
 * @title SAP Integration
 * @description Product List loader
 */
const PLPLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage> => {
  const { api } = ctx;
  const { url: baseUrl } = req;
  const { currentPage, fields, pageSize, term } = props;

  const url = new URL(baseUrl);
  let query = url.searchParams.get("query");
  const sort = query?.split(":")[1] || "";

  if (term) {
    query = term + query;
  }

  const data: ProductListResponse = await api[
    "GET /product/search"
  ]({ currentPage, fields, pageSize, query }, STALE).then((
    res: Response,
  ) => res.json());

  const products = data.products.map(convertProductData);
  const breadcrumb = convertBreadcrumb(data.breadcrumbs);
  const filters = convertFacetsToFilters(data.facets);
  const [previousPage, nextPage] = getPreviousNextPagination(data.pagination);

  return {
    "@type": "ProductListingPage",
    breadcrumb,
    filters,
    products,
    pageInfo: {
      currentPage: data.pagination.currentPage,
      nextPage,
      previousPage,
      pageTypes: ["Category", "SubCategory", "Collection"], // TODO: Filter these types.
    },
    sortOptions: [{ value: sort, label: sort }],
  };
};

export default PLPLoader;
