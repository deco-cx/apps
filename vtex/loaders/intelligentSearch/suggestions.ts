import { Suggestion } from "../../../commerce/types.ts";
import { fetchAPI } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import { paths } from "../../utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toProduct } from "../../utils/transform.ts";
import type { ProductSearchResult } from "../../utils/types.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;

  /**
   * @description Include similar products
   */
  similars?: boolean;
}

/**
 * @title VTEX Integration - Intelligent Search
 * @description Product Suggestion loader
 */
const loaders = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { url } = req;
  const { count, query } = props;
  const locale = "pt-BR"; // config!.defaultLocale; // TODO
  const segment = getSegment(req);
  const search = paths(ctx).api.io._v.api["intelligent-search"];

  const suggestions = () => {
    const params = new URLSearchParams({ query: query ?? "", locale });

    return fetchAPI<Suggestion>(
      `${search.search_suggestions}?${params}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    );
  };

  const topSearches = () => {
    const params = new URLSearchParams({ locale });

    return fetchAPI<Suggestion>(
      `${search.top_searches}?${params}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    );
  };

  const productSearch = () => {
    const facets = withDefaultFacets([], ctx);
    const params = withDefaultParams({ query, count: count ?? 4, locale }, ctx);

    return fetchAPI<ProductSearchResult>(
      `${search.product_search.facets(toPath(facets))}?${params}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    );
  };

  const [{ searches }, { products }] = await Promise.all([
    query ? suggestions() : topSearches(),
    productSearch(),
  ]);

  if (!searches || !productSearch) return null;

  const options = {
    baseUrl: url,
    priceCurrency: "BRL", // config!.defaultPriceCurrency, // TODO
  };

  setSegment(segment, ctx.response.headers);

  return {
    searches: count ? searches.slice(0, count) : searches,
    products: await Promise.all(
      products
        .map((p) => toProduct(p, p.items[0], 0, options)).map((p) =>
          withIsSimilarTo(ctx, p)
        ),
    ),
  };
};

export default loaders;
