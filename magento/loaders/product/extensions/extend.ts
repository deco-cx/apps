import { Product } from "../../../../commerce/types.ts";
import { STALE as DecoStale} from "../../../../utils/fetch.ts";
import { AppContext } from "../../../mod.ts";
import { toReviewAmasty } from "../../../utils/transform.ts";

export interface Props {
  reviews?: ExtensionProps;
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
  return `${req.url}-reviews:${
    props.reviews?.active ?? false
  }|url:${props.reviews?.path ?? false}-amastyExtensions`;
};

const reviewsExt = async (
  products: Product[],
  props: ExtensionProps,
  ctx: AppContext
): Promise<Product[]> => {
  const STALE = ctx.enableCache ? DecoStale : undefined

  const reviews = await Promise.all(
    products.map(
      async (product) =>
        await ctx.clientAdmin["GET /rest/:reviewUrl/:productId"](
          {
            reviewUrl: sanitizePath(props.path),
            productId: product!.productID,
          },
          STALE
        ).then((review) => review.json())
    )
  );

  return toReviewAmasty(products, reviews);
};
export default async (
  { products, reviews }: Props,
  _req: Request,
  ctx: AppContext
): Promise<Product[]> => {
  if (reviews?.active) {
    return await reviewsExt(products, reviews, ctx);
  }

  return products;
};

const sanitizePath = (path: string) => path.replace(/^\/?(rest\/)?/, "");
