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

  const start = performance.now();

  const isSimilarTo = await relatedProductsLoader(
    {
      crossSelling: "similars",
      id: product.inProductGroupWithID,
    },
    req,
    ctx,
  );

  console.log("withIsSimilarTo", performance.now() - start, "ms");

  return {
    ...product,
    isSimilarTo: isSimilarTo ?? undefined,
  };
};
