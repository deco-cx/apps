import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  getFilterParam,
  getPaginationInfo,
  getSortParam,
  resolvePage,
  toFilters,
  toProduct,
  toSortOption,
} from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { Filter, SearchSort } from "../utils/typings.ts";

export interface Props {
  /**
   * @description Number of products that must be returned per page
   */
  size: number;
  /**
   * @hide
   */
  from?: number;
  /**
   * @hide
   */
  filter?: Filter[];
  /**
   * @hide
   */
  searchSort?: SearchSort;
}

/**
 * @title Smarthint Integration - Hotsite
 * @description Product List Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api, shcode, cluster } = ctx;
  const { size = 12, from: fromParam = 0, filter = [], searchSort } = props;

  const url = new URL(req.url);

  const { page, from } = resolvePage(url, size, fromParam);

  const sort = getSortParam(url, searchSort);

  const filters = getFilterParam(url, filter);

  const anonymous = getSessionCookie(req.headers);

  const data = await api["GET /:cluster/hotsite"]({
    cluster,
    shcode,
    anonymous,
    url: url.pathname.replace("/", ""),
    size,
    from,
    searchSort: Number(sort),
    filter: filters,
  }).then((r) => r.json());

  if (data.SearchResult?.IsRedirect) {
    redirect(
      new URL(data.SearchResult?.urlRedirect!, url.origin)
        .href,
    );
  }

  const products =
    data.SearchResult?.Products?.map((product) => toProduct(product)) ?? [];

  const sortOptions = toSortOption(data.SearchResult?.Sorts ?? []);

  const resultFilters = toFilters(data.SearchResult?.Filters ?? [], url);

  const { nextPage, previousPage } = getPaginationInfo(
    url,
    size,
    from,
    page,
    data?.SearchResult?.TotalResult,
  );

  return {
    "@type": "ProductListingPage",
    products: products,
    sortOptions,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: resultFilters,
    pageInfo: {
      records: data?.SearchResult?.TotalResult,
      recordPerPage: size,
      nextPage: nextPage,
      previousPage: previousPage,
      currentPage: page,
      pageTypes: [
        "Cluster",
      ],
    },
  };
};

export default loader;
