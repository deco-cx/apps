import { Product } from "../../../../commerce/types.ts";
import { STALE } from "../../../../utils/fetch.ts";
import { AppContext } from "../../../mod.ts";
import { toReviewAmasty } from "../../../utils/transform.ts";

export interface Props {
  reviews?: ReviewProps;
  products: Product[];
}

interface ReviewProps extends ExtensionProps {
  maxRatingValue: number;
  minRatingValue: number;
}

interface ExtensionProps {
  active: boolean;
  /**
   * @title Path of the REST API
   */
  path: string;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  return `${req.url}-reviews:${
    props.reviews?.active ?? false
  }-amastyExtensions`;
};

const reviewsExt = async (
  products: Product[],
  props: ReviewProps,
  ctx: AppContext
): Promise<Product[]> => {
  const { maxRatingValue, minRatingValue } = props;

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

  return toReviewAmasty(products, reviews, {
    maxRatingValue,
    minRatingValue,
  });
};
export default async (
  { products, reviews }: Props,
  _req: Request,
  ctx: AppContext
): Promise<Product[]> => {
  let newProducts = products;

  if (reviews?.active) {
    newProducts = await reviewsExt(newProducts, reviews, ctx);
  }

  return newProducts;
};

const sanitizePath = (path: string) => path.replace(/^\/?(rest\/)?/, "");
