import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import type { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import { pageTypesToSeo } from "../../utils/legacy.ts";
import {
  getSegmentCacheKeyWithoutUTM,
  getSegmentFromBag,
  withSegmentParams,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { HttpError } from "../../../utils/http.ts";
import { pickSku, toProductPage } from "../../utils/transform.ts";
import type {
  AdvancedLoaderConfig,
  Product as VTEXProduct,
  SimulationBehavior,
} from "../../utils/types.ts";
import PDPDefaultPath from "../paths/PDPDefaultPath.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
  /**
   * @title Indexing Skus
   * @description Index of product pages with the `skuId` parameter
   */
  indexingSkus?: boolean;
  /**
   * @title Advanced Configuration
   * @description Further change loader behaviour
   */
  advancedConfigs?: AdvancedLoaderConfig;
  /**
   * @title Simulation Behavior
   * @description Defines the simulation behavior.
   */
  simulationBehavior?: SimulationBehavior;
}

/**
 * @title Product Details Page - Intelligent Search
 * @description List a product details page, with product and SEO data. commonly used for product pages.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { vcsDeprecated } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const haveToUseSlug = slug && !slug.startsWith(":slug");
  let defaultPaths;

  if (!haveToUseSlug) {
    defaultPaths = await PDPDefaultPath({ count: 1 }, req, ctx);
  }

  const lowercaseSlug = haveToUseSlug
    ? slug?.toLowerCase()
    : defaultPaths?.possiblePaths[0];
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  const pageTypePromise = vcsDeprecated
    ["GET /api/catalog_system/pub/portal/pagetype/:term"](
      { term: `${lowercaseSlug}/p` },
      STALE,
    ).then((res) => res.json());

  const url = new URL(baseUrl);
  const skuId = url.searchParams.get("skuId");

  // The v1 Intelligent Search exposes a dedicated single-product endpoint.
  // Look it up by SKU when a skuId is present in the URL, otherwise by slug —
  // no need to resolve the productId from the pageType API anymore.
  const [field, value] = skuId
    ? (["sku", skuId] as const)
    : (["slug", lowercaseSlug] as const);

  // Without a skuId or a slug there is nothing to look up, 404
  if (!value) {
    return null;
  }

  const product = await vcsDeprecated
    ["GET /api/intelligent-search/v1/products"]({
      field,
      value,
      locale,
      simulationBehavior: props.simulationBehavior ?? "default",
      ...withSegmentParams(segment),
      // sc is required by this endpoint to resolve pricing/availability.
      sc: segment?.payload?.channel ?? ctx.salesChannel ?? "1",
    }, STALE)
    .then((res) => res.json())
    .catch((error) => {
      // A missing product resolves to a 404 on the v1 products endpoint;
      // translate it into a not-found page instead of surfacing the error.
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    });

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  let kitItems: VTEXProduct[] = [];
  if (sku.isKit && sku.kitItems) {
    // Kit components are a multi-SKU lookup, which the single-product endpoint
    // does not support, so it stays on the product_search pipeline.
    const params = withDefaultParams({
      query: `sku:${sku.kitItems.join(";")}`,
      count: sku.kitItems.length,
      simulationBehavior: props.simulationBehavior ?? "default",
    });

    const result = await vcsDeprecated
      ["GET /api/intelligent-search/v1/product-search/*facets"]({
        ...params,
        ...withSegmentParams(segment),
        facets: toPath(withDefaultFacets([], ctx)),
      }, STALE)
      .then((res) => res.json());

    kitItems = result.products;
  }

  const pageType = await pageTypePromise;

  const page = toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: segment?.payload?.currencyCode ?? "BRL",
    includeOriginalAttributes: props.advancedConfigs?.includeOriginalAttributes,
  });

  const isPageProduct = pageType.pageType === "Product";

  const seo = isPageProduct ? pageTypesToSeo([pageType], baseUrl) : null;

  return {
    ...page,
    product: props.similars
      ? await withIsSimilarTo(req, ctx, page.product)
      : page.product,
    seo: isPageProduct && seo
      ? {
        ...seo,
        noIndexing: props.indexingSkus ? false : seo.noIndexing,
      }
      : null,
  };
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const segment = ctx.advancedConfigs?.removeUTMFromCacheKey
    ? getSegmentCacheKeyWithoutUTM(ctx)
    : getSegmentFromBag(ctx)?.token;
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId") ?? "";

  const params = new URLSearchParams([
    ["slug", props.slug],
    ["segment", segment ?? ""],
    ["skuId", skuId],
  ]);

  url.search = params.toString();

  return url.href;
};

export default loader;
