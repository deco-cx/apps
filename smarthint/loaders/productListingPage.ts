import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toFilters, toProduct, toSortOption } from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";

/**
 * @title Smarthint Integration
 * @description Product List Page
 */
const action = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api, shcode, cluster } = ctx;

  const url = new URL(req.url);

  const data = await api["GET /v:cluster/hotsite"]({
    cluster,
    shcode,
    anonymous: "1", //TODO
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

  const filters = toFilters(data.SearchResult?.Filters ?? []);

  return {
    "@type": "ProductListingPage",
    products: products,
    sortOptions,
    filters,
    pageInfo: {
      records: data.SearchResult?.TotalResult,
    },
  };
};

export default action;
