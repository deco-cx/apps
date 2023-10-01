import { Suggestion } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import { SEGMENT, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toProduct } from "../../utils/transform.ts";

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
  const { vcs } = ctx;
  const { url } = req;
  const { count, query } = props;
  const locale = "pt-BR"; // config!.defaultLocale; // TODO
  const segment = ctx.bag.get(SEGMENT);

  const suggestions = () =>
    vcs["GET /api/io/_v/api/intelligent-search/search_suggestions"]({
      locale,
      query: query ?? "",
    }, {
      // Not adding suggestions to cache since queries are very spread out
      // deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    }).then((res) => res.json());

  const topSearches = () =>
    vcs["GET /api/io/_v/api/intelligent-search/top_searches"]({
      locale,
    }, {
      deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    }).then((res) => res.json());

  const productSearch = () => {
    const facets = withDefaultFacets([], ctx);
    const params = withDefaultParams({ query, count: count ?? 4, locale });

    return vcs["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
      ...params,
      facets: toPath(facets),
    }, {
      deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    }).then((res) => res.json());
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

  return {
    searches: count ? searches.slice(0, count) : searches,
    products: await Promise.all(
      products
        .map((p) => toProduct(p, p.items[0], 0, options)).map((p) =>
          withIsSimilarTo(req, ctx, p)
        ),
    ),
  };
};

export default loaders;
