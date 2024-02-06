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
  getSegmentFromBag,
  isAnonymous,
  withSegmentCookie,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { pickSku, toProductPage } from "../../utils/transform.ts";
import type { PageType, Product as VTEXProduct } from "../../utils/types.ts";
import PDPDefaultPath from "../paths/PDPDefaultPath.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
}

/**
 * When there's no ?skuId querystring, we need to figure out the product id
 * from the pathname. For this, we use the pageType api
 */
const getProductID = (page: PageType) => {
  if (page.pageType !== "Product") {
    return null;
  }

  return page.id!;
};

/**
 * @title VTEX Integration - Intelligent Search
 * @description Product Details Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { vcsDeprecated } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const haveToUseSlug = slug && !slug.startsWith(":");
  let defaultPaths;

  if (!haveToUseSlug) {
    defaultPaths = await PDPDefaultPath({ count: 1 }, req, ctx);
  }

  const lowercaseSlug = haveToUseSlug
    ? slug?.toLowerCase()
    : defaultPaths?.possiblePaths[0];
  const segment = getSegmentFromBag(ctx);

  const pageTypePromise = vcsDeprecated
    ["GET /api/catalog_system/pub/portal/pagetype/:term"](
      { term: `${lowercaseSlug}/p` },
      STALE,
    ).then((res) => res.json());

  const url = new URL(baseUrl);
  const skuId = url.searchParams.get("skuId");
  const productId = !skuId && getProductID(await pageTypePromise);

  /**
   * Fetch the exact skuId. If no one was provided, try fetching the product
   * and return the first sku
   */
  const query = skuId
    ? `sku:${skuId}`
    : productId
    ? `product:${productId}`
    : null;

  // In case we dont have the skuId or the productId, 404
  if (!query) {
    return null;
  }

  const facets = withDefaultFacets([], ctx);
  const params = withDefaultParams({ query, count: 1 });

  const { products: [product] } = await vcsDeprecated
    ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
      ...params,
      facets: toPath(facets),
    }, { ...STALE, headers: withSegmentCookie(segment) })
    .then((res) => res.json());

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  let kitItems: VTEXProduct[] = [];
  if (sku.isKit && sku.kitItems) {
    const params = withDefaultParams({
      query: `sku:${sku.kitItems.join(";")}`,
      count: sku.kitItems.length,
    });

    const result = await vcsDeprecated
      ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
        ...params,
        facets: toPath(facets),
      }, { ...STALE, headers: withSegmentCookie(segment) })
      .then((res) => res.json());

    kitItems = result.products;
  }

  const pageType = await pageTypePromise;

  const page = toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: segment?.payload?.currencyCode ?? "BRL",
  });

  return {
    ...page,
    product: props.similars
      ? await withIsSimilarTo(req, ctx, page.product)
      : page.product,
    seo: pageType.pageType === "Product"
      ? pageTypesToSeo([pageType], baseUrl)
      : null,
  };
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  if (!isAnonymous(ctx)) {
    return null;
  }
  const { token } = getSegmentFromBag(ctx);
  const url = new URL(req.url);

  const params = new URLSearchParams([
    ["slug", props.slug],
  ]);
  params.set("skuId", url.searchParams.get("skuId") ?? "");
  params.set("segment", token);

  url.search = params.toString();

  return url.href;
};

export default loader;
