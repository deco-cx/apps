import type { Product } from "../../commerce/types.ts";
import relatedProductsLoader from "../loaders/legacy/relatedProductsLoader.ts";
import { AppContext } from "../mod.ts";

export const withIsSimilarTo = async (
  req: Request,
  ctx: AppContext,
  product: Product,
) => {
  const id = product.isVariantOf?.productGroupID;

  if (!id) {
    return product;
  }

  const isSimilarTo = await relatedProductsLoader(
    {
      crossSelling: "similars",
      id: product.inProductGroupWithID,
    },
    req,
    ctx,
  );

  return {
    ...product,
    isSimilarTo: isSimilarTo ?? undefined,
  };
};
