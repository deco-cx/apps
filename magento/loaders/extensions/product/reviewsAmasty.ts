import { Product } from "../../../../commerce/types.ts";
import { STALE as DecoStale } from "../../../../utils/fetch.ts";
import { AppContext } from "../../../mod.ts";
import { toReviewAmasty } from "../../../utils/transform.ts";
import { sanitizePath } from "../../../utils/utils.ts";

type Props = {
  products: Product[];
  path: string;
};

/**
 * @title Magento Product Extension Loader - Reviews Amasty
 * @description Only invokable
 */
async function loader(
  { products, path }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[]> {
  const STALE = ctx.enableCache ? DecoStale : undefined;

  const reviews = await Promise.all(
    products.map(
      async (product) =>
        await ctx.clientAdmin["GET /rest/:reviewUrl/:productId"](
          {
            reviewUrl: sanitizePath(path),
            productId: product!.productID,
          },
          STALE,
        ).then((review) => review.json()),
    ),
  );

  return toReviewAmasty(products, reviews);
}

export const cache = "stale-while-revalidate";

export const cacheKey = (
  { products, path }: Props,
  _req: Request,
  _ctx: AppContext,
) => {
  const skus = products?.reduce((acc, p) => `${acc}|${p.sku}`, "");
  return `${skus}-amastyReviewsExt-${path}`;
};

export default loader;
