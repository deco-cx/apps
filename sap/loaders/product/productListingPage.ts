import { ProductListingPage } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import type { AppContext } from "../../mod.ts";
import {
  Facet,
  FieldsList,
  ProductListResponse,
  Sort,
} from "../../utils/types.ts";
import { convertBreadcrumb, convertFacetsToFilters, convertProductData, getPreviousNextPagination } from "../../utils/transform.ts";

export interface Props {
  /**
   * @description The category ID.
   * @hide true
   */
  categoryId: string;
  /**
   * @description The current result page requested.
   * @hide true
   *  @default 0
   */
  currentPage?: number;
  /** @description The selected facets used in the search. */
  facets: Facet[];
  /**
   * @title Fields
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   *  @default DEFAULT
   */
  fields?: FieldsList;
  /**
   * @title Items per page
   * @description The number of results returned per page.
   *  @default 12
   */
  pageSize?: number;
  /**
   * @title Sorting
   * @description Sorting method applied to the return results.
   *  @default relevance
   */
  sort: Sort;
}

/**
 * @title SAP Integration
 * @description Product List loader
 */
const productListLoader = async (
  props: Props,
  _req: Request,
  ctx: AppContext
): Promise<ProductListingPage> => {
  const { api } = ctx;
  const { categoryId, currentPage, facets, fields, pageSize, sort } = props;

  const facetsQuery = facets
    .reduce(
      (prev, curr) => [...prev, `${curr.key}:${curr.value}`],
      [] as string[]
    )
    .join(":");

  const query = `:${sort}:${facetsQuery}`;

  const data: ProductListResponse = await api[
    "GET /categories/:categoryId/products"
  ]({ categoryId, currentPage, fields, pageSize, query }, STALE).then((res) =>
    res.json()
  );

  const products = data.products.map(convertProductData)
  const breadcrumb = convertBreadcrumb(data.breadcrumbs)
  const filters = convertFacetsToFilters(data.facets)
  const [previousPage, nextPage] = getPreviousNextPagination(data.pagination)

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

export default productListLoader;
