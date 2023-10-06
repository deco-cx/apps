import type { Product } from "../../commerce/types.ts";
import type { LegacyProduct, Product as VTEXProduct } from "../utils/types.ts";
import type { AppContext } from "../mod.ts";
import type { Sort } from "../utils/types.ts";

import { toProduct } from "../utils/transform.ts";
import { getSegment, withSegmentCookie } from "../utils/segment.ts";

interface Params {
  query: string;
  page: number;
  count: number;
  sort: Sort;
  fuzzy: string;
  locale?: string;
  hideUnavailableItems: boolean;
}

interface WithKitLookToProps {
  vtexProducts: VTEXProduct[];
  params: Params;
  options: {
    baseUrl: string;
    priceCurrency: string;
  };
  ctx: AppContext;
}

interface GETProductKitLookItem {
  product: LegacyProduct;
  ctx: AppContext;
  params: Params;
}

/** Retrieves a KitLook items for a given product. */
async function getKitlookItem({ product, ctx, params }: GETProductKitLookItem) {
  const { vcsDeprecated } = ctx;
  const { items } = product;
  if (!items[0]?.isKit || !product.items[0]?.kitItems) return [];

  const kitItems = await vcsDeprecated
    ["GET /api/catalog_system/pub/products/search/:term?"]({
      ...params,
      fq: product.items[0].kitItems.map((item) => `skuId:${item.itemId}`),
    }, { deco: { cache: "stale-while-revalidate" } });

  return kitItems.json();
}

/** Retrieves VTEX products with Kitlook. */
export async function withIsKitlookTo(
  { vtexProducts, params, options, ctx }: WithKitLookToProps,
): Promise<Array<LegacyProduct & { kitItems: Product[] }>> {
  const { vcsDeprecated } = ctx;
  const segment = getSegment(ctx);

  const productIds = vtexProducts.map((p) => p.productId);

  const products: LegacyProduct[] = await vcsDeprecated
    [
      `GET /api/catalog_system/pub/products/search/:term?`
    ](
      {
        ...params,
        fq: productIds.map((productId) => `productId:${productId}`),
      },
      {
        deco: { cache: "stale-while-revalidate" },
        headers: withSegmentCookie(segment),
      },
    ).then((res: Response) => res.json());

  const formattedProducts = await Promise.all(products.map(async (product) => {
    const kitItems: LegacyProduct[] = await getKitlookItem({
      product,
      ctx,
      params,
    });

    return {
      ...product,
      kitItems: kitItems.map((p) => toProduct(p, p.items[0], 0, options)),
    };
  }));

  return formattedProducts;
}
