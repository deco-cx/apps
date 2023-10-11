import type { Product } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import type { Sort } from "../utils/types.ts";

import { getSegment, withSegmentCookie } from "../utils/segment.ts";
import productListLoader from "../loaders/intelligentSearch/productList.ts";

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
  products: Product[];
  params: Params;
  req: Request;
  ctx: AppContext;
}

/** Retrieves VTEX products with Kitlook. */
export async function withKitItems({
  products,
  params,
  req,
  ctx,
}: WithKitLookToProps): Promise<Product[]> {
  const { vcsDeprecated } = ctx;
  const segment = getSegment(ctx);

  const productIds = Array.from(
    new Set(products.map((p) => p.isVariantOf?.productGroupID)),
  );

  const legacyProducts = await vcsDeprecated[
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
  ).then((res) => res.json());

  const productKitIds = Array.from(
    new Set(
      legacyProducts.flatMap(
        (p) => p.items[0].kitItems?.map((i) => i.itemId) ?? [],
      ),
    ),
  );

  const kitProducts = await productListLoader(
    {
      props: {
        ids: productKitIds,
      },
    },
    req,
    ctx,
  );

  const formattedProducts = products.map((product) => {
    const legacyProduct = legacyProducts.find(
      (p) => p.productId === product.isVariantOf?.productGroupID,
    );

    if (!legacyProduct) {
      return { ...product, isAccessoryOrSparePartFor: [] };
    }

    const [legacyItem] = legacyProduct.items;

    const kitItems = legacyItem?.kitItems?.flatMap((kitItem) => {
      const kitProduct = kitProducts?.find(
        (p) => p.productID === kitItem.itemId,
      );

      if (!kitProduct) {
        return [];
      }

      return [kitProduct];
    }) ?? [];

    console.log({ kitItems });

    return {
      ...product,
      isAccessoryOrSparePartFor: kitItems,
    };
  });

  return formattedProducts;
}
