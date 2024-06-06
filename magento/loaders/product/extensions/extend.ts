import { Product } from "../../../../commerce/types.ts";
import { STALE } from "../../../../utils/fetch.ts";
import { AppContext } from "../../../mod.ts";
import { ReviewsAmastyAPI } from "../../../utils/client/types.ts";
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
      ctx.clientAdmin["GET /rest/:reviewUrl/:productId"]({
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
  let newProducts = products;

  if (reviews?.active) {
    newProducts = await reviewsExt(newProducts, reviews.path, ctx);
  }

  return newProducts;
};

const sanitizePath = (path: string) => path.replace(/^\/?(rest\/)?/, "");
