import { BreadcrumbList, ProductListingPage } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { ProductListResponse } from "../../utils/types.ts";
import {
  convertBreadcrumb,
  convertFacetsToFilters,
  convertProductData,
  getPreviousNextPagination,
} from "../../utils/transform.ts";

export interface Props {
  /**
   * @description Category code of the products of this page.
   */
  categoryCode?: string;
  /**
   * @description The current result page requested.
   * @hide true
   * @default 0
   */
  currentPage?: number;
  /**
   * @title Fields
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   * @default FULL
   */
  fields?: string;
  /**
   * @title Items per page
   * @description The number of results returned per page.
   * @default 12
   */
  pageSize?: number;
}

/**
 * @title SAP Integration
 * @description Product List loader
 */
const PLPLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api } = ctx;
  const { url: baseUrl } = req;
  const { categoryCode, currentPage, fields, pageSize } = props;

  const url = new URL(baseUrl);
  let query = url.searchParams.get("q");
  const sort = query?.split(":")[1] || "";

  if (!query) {
    query = `:relevance:allCategories:${categoryCode}`;
  }

  query = decodeURIComponent(query.replace(/\+/g, " "));

  const data: ProductListResponse = await api[
    "GET /users/anonymous/eluxproducts/search"
  ]({
    currentPage,
    fields: `${fields},facets,products(FULL)`,
    pageSize,
    query,
    sort: "approvalStatusSort",
    searchType: "FINISHED_GOODS",
  }).then(
    (
      res: Response,
    ) => res.json(),
  );

  const products = data.products.map(convertProductData);

  let breadcrumb: BreadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: [],
    numberOfItems: 0,
  };
  if (data.breadcrumbs) {
    breadcrumb = convertBreadcrumb(data.breadcrumbs);
  }

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
      recordPerPage: data.pagination.totalResults < data.pagination.pageSize
        ? data.pagination.totalResults
        : data.pagination.pageSize,
      records: data.pagination.totalResults,
    },
    sortOptions: [{ value: sort, label: sort }],
  };
};

export default PLPLoader;
