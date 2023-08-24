import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { fetchAPI } from "../../../utils/fetch.ts";
import type { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { toSegmentParams } from "../../utils/legacy.ts";
import { paths } from "../../utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { pickSku, toProductPage } from "../../utils/transform.ts";
import type { LegacyProduct } from "../../utils/types.ts";

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
      deco: { cache: "stale-while-revalidate" },
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
      { deco: { cache: "stale-while-revalidate" } },
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
