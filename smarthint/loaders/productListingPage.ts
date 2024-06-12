import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toFilters, toProduct, toSortOption } from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";
import { getSessionCookie } from "../utils/getSession.ts";

/**
 * @title Smarthint Integration - Hotsite
 * @description Product List Page
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api, shcode, cluster } = ctx;

  const url = new URL(req.url);
  const anonymous = getSessionCookie(req.headers);

  const data = await api["GET /:cluster/hotsite"]({
    cluster,
    shcode,
    anonymous,
    url: url.pathname,
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

  const filters = toFilters(data.SearchResult?.Filters ?? [], url);

  return {
    "@type": "ProductListingPage",
    products: products,
    sortOptions,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters,
    pageInfo: {
      records: data.SearchResult?.TotalResult,
      recordPerPage: data.SearchResult?.TotalResult,
      nextPage: undefined,
      previousPage: undefined,
      currentPage: 0,
      pageTypes: [
        "Cluster",
      ],
    },
  };
};

export default loader;
