import { Product } from "../../../../commerce/types.ts";
import { STALE as DecoStale } from "../../../../utils/fetch.ts";
import { AppContext } from "../../../mod.ts";
import { toLiveloPoints, toReviewAmasty } from "../../../utils/transform.ts";

export interface Props {
  reviews?: ExtensionProps;
  liveloPoints?: ExtensionProps;
  products: Product[];
}

interface ExtensionProps {
  active: boolean;
  /**
   * @title Path of the REST API
   * @description The partial path of the API. ex: /all/V1/custom/review
   */
  path: string;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  const url = new URL(req.url);
  const reviews = props.reviews?.active ?? false;
  const liveloPoints = props.liveloPoints?.active ?? false;
  return `${url.hostname}${url.pathname}-reviews:${reviews}-liveloPoints${liveloPoints}|urls:${
    props.reviews?.path ?? false
  }&${props.liveloPoints?.path ?? false}-extensions`;
};

const reviewsExt = async (
  products: Product[],
  props: ExtensionProps,
  ctx: AppContext,
): Promise<Product[]> => {
  const STALE = ctx.enableCache ? DecoStale : undefined;

  const reviews = await Promise.all(
    products.map(
      async (product) =>
        await ctx.clientAdmin["GET /rest/:reviewUrl/:productId"](
          {
            reviewUrl: sanitizePath(props.path),
            productId: product!.productID,
          },
          STALE,
        ).then((review) => review.json()),
    ),
  );

  return toReviewAmasty(products, reviews);
};

const liveloExt = async (
  products: Product[],
  props: ExtensionProps,
  ctx: AppContext,
): Promise<Product[]> => {
  const STALE = ctx.enableCache ? DecoStale : undefined;

  const liveloPoints = await Promise.all(
    products.map(
      async (product) =>
        await ctx.clientAdmin["GET /rest/:liveloUrl/:productId"](
          {
            liveloUrl: sanitizePath(props.path),
            productId: product!.productID,
          },
          STALE,
        ).then((points) => points.json()),
    ),
  );

  return toLiveloPoints(products, liveloPoints);
};

export default async (
  { products, reviews, liveloPoints }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[]> => {
  let p = products;

  if (reviews?.active) {
    p = await reviewsExt(products, reviews, ctx);
  }

  if (liveloPoints?.active) {
    p = await liveloExt(products, liveloPoints, ctx);
  }

  return p;
};

const sanitizePath = (path: string) => path.replace(/^\/?(rest\/)?/, "");
