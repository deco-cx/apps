import { Product } from "../../../../commerce/types.ts";
import { AppContext } from "../../../mod.ts";

export interface Props {
  reviews?: ExtensionProps;
  products: Product[];
}

interface ExtensionProps {
  active: boolean;
  path: string;
}

const reviewsExt = async (
  products: Product[],
  path: string,
  ctx: AppContext
): Promise<Product[]> => {
  const reviewPromise = await products.map(
    async (product) =>
      await ctx.clientCustom["GET /rest/:reviewUrl/:productId"]({
        reviewUrl: path,
        productId: product!.productID,
      }).then((res) => res.json())
  );

  const reviewsPromise = Promise.all(reviewPromise);

  const [reviews] = await Promise.all([reviewsPromise]);

  console.log(reviews)
  //transform in review
  return products;
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
