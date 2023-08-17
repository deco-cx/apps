import { AppContext } from "apps/vtex/mod.ts";
import type { ProductDetailsPage } from "apps/commerce/types.ts";
import type { RequestURLParam } from "apps/website/functions/requestToParam.ts";
import type { LegacyProduct } from "apps/vtex/utils/types.ts";
import { toSegmentParams } from "apps/vtex/utils/legacy.ts";
import { paths } from "apps/vtex/utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "apps/vtex/utils/segment.ts";
import { pickSku, toProductPage } from "apps/vtex/utils/transform.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { fetchAPI } from "apps/utils/fetch.ts";

export interface Props {
  slug: RequestURLParam;

  /**
   * @description Include similar products
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
  const { url: baseUrl } = req;
  const { slug } = props;
  const url = new URL(baseUrl);
  const segment = getSegment(req);
  const params = toSegmentParams(segment);
  const search = paths(ctx).api.catalog_system.pub.products.search;
  const skuId = url.searchParams.get("skuId");

  const [product] = await fetchAPI<LegacyProduct[]>(
    `${search.term(`${slug}/p`)}?${params}`,
    {
      withProxyCache: true,
      headers: withSegmentCookie(segment),
    },
  );

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  let kitItems: LegacyProduct[] = [];
  if (sku.isKit && sku.kitItems) {
    const p = new URLSearchParams(params);

    sku.kitItems.forEach(({ itemId }) => p.append("fq", `skuId:${itemId}`));

    kitItems = await fetchAPI<LegacyProduct[]>(
      `${search}?${p}`,
      { withProxyCache: true },
    );
  }

  setSegment(segment, ctx.response.headers);

  const page = toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: "BRL", //  config!.defaultPriceCurrency, // TODO: fix currency
  });

  return {
    ...page,
    product: props.similars
      ? await withIsSimilarTo(ctx, page.product)
      : page.product,
    seo: {
      title: product.productTitle,
      description: product.metaTagDescription,
      canonical: new URL(`/${product.linkText}/p`, url.origin).href,
    },
  };
}

export default loader;
