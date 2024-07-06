import { Product } from "../../commerce/types.ts";
import { STALE as DecoStale } from "../../utils/fetch.ts";
import { AppContext } from "../mod.ts";
import { toLiveloPoints, toReviewAmasty } from "./transform.ts";

export const reviewsExt = async (
  products: Product[],
  path: string,
  ctx: AppContext,
): Promise<Product[]> => {
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
};

export const liveloExt = async (
  products: Product[],
  path: string,
  ctx: AppContext,
): Promise<Product[]> => {
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
};

const sanitizePath = (path: string) => path.replace(/^\/?(rest\/)?/, "");
