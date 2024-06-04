import { Product } from "../../../../commerce/types.ts";
import { STALE } from "../../../../utils/fetch.ts";
import { AppContext } from "../../../mod.ts";
import { ReviewsAmastyAPI } from "../../../utils/clientCustom/types.ts";
import { toReviewAmasty } from "../../../utils/transform.ts";

export interface Props {
  reviews?: ExtensionProps;
  products: Product[];
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
  return `${req.url}-reviews:${props.reviews?.active ?? false}-amastyExtensions`;
};


const reviewsExt = async (
  products: Product[],
  path: string,
  ctx: AppContext
): Promise<Product[]> => {
  const reviewPromise = products.map<Promise<ReviewsAmastyAPI>>(
    (product) =>
      ctx.clientCustom["GET /rest/:reviewUrl/:productId"]({
        reviewUrl: sanitizePath(path),
        productId: product!.productID,
      }, STALE).then((res) => res.json())
  );

  const reviewsPromise = Promise.all(reviewPromise);

  const [reviews] = await Promise.all([reviewsPromise]);

  return toReviewAmasty(products, reviews);
};

export default async (
  { products, reviews }: Props,
  _req: Request,
  ctx: AppContext
): Promise<Product[]> => {
  let p = products;

  if (reviews?.active) {
    p = await reviewsExt(p, reviews.path, ctx);
  }

  return p;
};

const sanitizePath = (path: string) => path.replace(/^\/?(rest\/)?/, "");
