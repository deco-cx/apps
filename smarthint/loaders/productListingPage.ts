import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toFilters, toProduct, toSortOption } from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { Filter, SearchSort } from "./searchListPage.ts";

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

  const page = Number(url.searchParams.get("page") ?? 1);
  const from = fromParam ?? page <= 1 ? 0 : (page - 1) * size;

  const sort = url.searchParams.get("sort") ??
    url.searchParams.get("searchSort") ?? searchSort;

  const filters = url.searchParams.getAll("filter").length
    ? url.searchParams.getAll("filter")
    : filter.length
    ? filter.map((filterItem) => `${filterItem.field}:${filterItem.value}`)
    : undefined;

  const anonymous = getSessionCookie(req.headers);

  const data = await api["GET /:cluster/hotsite"]({
    cluster,
    shcode,
    anonymous,
    url: url.pathname.replace("/", ""),
    size,
    from,
    searchSort: String(sort),
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

  const hasNextPage = (data?.SearchResult?.TotalResult ?? 0) > size;
  const hasPreviousPage = from > 0 &&
    (data?.SearchResult?.TotalResult ?? 0) > size;

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page - 1).toString());
  }

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
      nextPage: hasNextPage ? `?${nextPage}` : undefined,
      previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
      currentPage: page,
      pageTypes: [
        "Cluster",
      ],
    },
  };
};

export default loader;
