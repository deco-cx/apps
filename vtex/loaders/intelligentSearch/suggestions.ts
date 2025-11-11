import { Suggestion } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toProduct } from "../../utils/transform.ts";
import type { AdvancedLoaderConfig } from "../../utils/types.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;

  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
  /**
   * @title Advanced Configuration
   * @description Further change loader behaviour
   */
  advancedConfigs?: AdvancedLoaderConfig;
}

/**
 * @title Suggestions Intelligent Search
 * @description List a product suggestion, with products and SEO data. commonly used for search suggestions and autocomplete.
 */
const loaders = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { vcsDeprecated } = ctx;
  const { url } = req;
  const { count, query } = props;
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  const suggestions = () =>
    vcsDeprecated["GET /api/io/_v/api/intelligent-search/search_suggestions"]({
      locale,
      query: query ?? "",
    }, {
      // Not adding suggestions to cache since queries are very spread out
      // deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    }).then((res) => res.json());

  const topSearches = () =>
    vcsDeprecated["GET /api/io/_v/api/intelligent-search/top_searches"]({
      locale,
    }, { ...STALE, headers: withSegmentCookie(segment) })
      .then((res) => res.json());

  const productSearch = () => {
    const facets = withDefaultFacets([], ctx);
    const params = withDefaultParams({ query, count: count ?? 4, locale });

    return vcsDeprecated
      ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
        ...params,
        facets: toPath(facets),
      }, { ...STALE, headers: withSegmentCookie(segment) })
      .then((res) => res.json());
  };

  const [{ searches }, { products, recordsFiltered }] = await Promise.all([
    query ? suggestions() : topSearches(),
    productSearch(),
  ]);

  if (!searches || !productSearch) return null;

  const options = {
    baseUrl: url,
    priceCurrency: segment?.payload?.currencyCode ?? "BRL",
    includeOriginalAttributes: props.advancedConfigs?.includeOriginalAttributes,
  };

  return {
    searches: count ? searches.slice(0, count) : searches,
    products: await Promise.all(
      products
        .map((p) => toProduct(p, p.items[0], 0, options)).map((p) =>
          withIsSimilarTo(req, ctx, p)
        ),
    ),
    hits: recordsFiltered,
  };
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, _req: Request, ctx: AppContext) => {
  const segment = getSegmentFromBag(ctx)?.token ?? "";
  return `suggestions-${props.query ?? ""}-${props.count ?? 4}-${segment}`;
};

export default loaders;
