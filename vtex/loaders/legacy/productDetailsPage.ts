import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import type { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { toSegmentParams } from "../../utils/legacy.ts";
import {
  getSegmentFromBag,
  isAnonymous,
  withSegmentCookie,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { pickSku, toProductPage } from "../../utils/transform.ts";
import type { LegacyProduct } from "../../utils/types.ts";
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
 * @title VTEX Integration - Legacy Search
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
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
    : defaultPaths?.possiblePaths[0] || "/";
  const url = new URL(baseUrl);
  const segment = getSegmentFromBag(ctx);
  const params = toSegmentParams(segment);
  const skuId = url.searchParams.get("skuId");

  const response = await vcsDeprecated
    ["GET /api/catalog_system/pub/products/search/:slug/p"](
      { ...params, slug: lowercaseSlug },
      { ...STALE, headers: withSegmentCookie(segment) },
    ).then((res) => res.json());

  if (response && !Array.isArray(response)) {
    throw new Error(
      `Error while fetching VTEX data ${JSON.stringify(response)}`,
    );
  }

  const [product] = response;

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  const kitItems: LegacyProduct[] =
    Array.isArray(sku.kitItems) && sku.kitItems.length > 0
      ? await vcsDeprecated
        ["GET /api/catalog_system/pub/products/search/:term?"](
          {
            ...params,
            _from: 0,
            _to: 49,
            fq: sku.kitItems.map((item) => `skuId:${item.itemId}`),
          },
          STALE,
        ).then((res) => res.json())
      : [];

  const page = toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: segment?.payload?.currencyCode ?? "BRL",
  });

  return {
    ...page,
    product: props.similars
      ? await withIsSimilarTo(req, ctx, page.product)
      : page.product,
    seo: {
      title: product.productTitle,
      description: product.metaTagDescription,
      canonical: new URL(`/${product.linkText}/p`, url.origin).href,
      noIndexing: !!skuId,
    },
  };
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const { token } = getSegmentFromBag(ctx);
  const url = new URL(req.url);

  if (url.searchParams.has("ft") || !isAnonymous(ctx)) {
    return null;
  }

  const params = new URLSearchParams([
    ["slug", props.slug],
  ]);

  url.searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  params.sort();
  params.set("segment", token);

  url.search = params.toString();

  return url.href;
};

export default loader;
