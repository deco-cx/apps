import { Product } from "../../../../commerce/types.ts";
import { STALE as DecoStale } from "../../../../utils/fetch.ts";
import { AppContext } from "../../../mod.ts";
import { ExtensionLoaderProps } from "../../../utils/client/types.ts";
import { toLiveloPoints } from "../../../utils/transform.ts";
import { sanitizePath } from "../../../utils/utils.ts";

/**
 * @title Magento Product Extension Loader - Livelo Points
 * @description Only invokable
 */
async function loader(
  { products, path }: ExtensionLoaderProps,
  _req: Request,
  ctx: AppContext,
): Promise<Product[]> {
  const STALE = ctx.enableCache ? DecoStale : undefined;

  const liveloPoints = await Promise.all(
    products.map(
      async (product) =>
        await ctx.clientAdmin["GET /rest/:liveloUrl/:productId"](
          {
            liveloUrl: sanitizePath(path),
            productId: product!.productID,
          },
          STALE,
        ).then((points) => points.json()),
    ),
  );

  return toLiveloPoints(products, liveloPoints);
}

export const cache = "stale-while-revalidate";

export const cacheKey = (
  { products, path }: ExtensionLoaderProps,
  _req: Request,
  _ctx: AppContext,
) => {
  const skus = products?.reduce((acc, p) => `${acc}|${p.sku}`, "");
  return `${skus}-liveloPointsExt-${path}`;
};

export default loader;
