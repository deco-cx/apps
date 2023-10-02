import type { ProductDetailsPage } from "../../../commerce/types.ts";
import type { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { toSegmentParams } from "../../utils/legacy.ts";
import { SEGMENT, withSegmentCookie } from "../../utils/segment.ts";
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
  const { vcs } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const url = new URL(baseUrl);
  const segment = ctx.bag.get(SEGMENT);
  const params = toSegmentParams(segment);
  const skuId = url.searchParams.get("skuId");

  const [product] = await vcs
    ["GET /api/catalog_system/pub/products/search/:slug/p"](
      { ...params, slug },
      {
        deco: { cache: "stale-while-revalidate" },
        headers: withSegmentCookie(segment),
      },
    ).then((res) => res.json());

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  const kitItems: LegacyProduct[] = sku.isKit && sku.kitItems
    ? await vcs["GET /api/catalog_system/pub/products/search/:term?"]({
      ...params,
      fq: sku.kitItems.map((item) => `skuId:${item.itemId}`),
    }, { deco: { cache: "stale-while-revalidate" } }).then((res) => res.json())
    : [];

  const page = toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: "BRL", //  config!.defaultPriceCurrency, // TODO: fix currency
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
    },
  };
}

export default loader;
