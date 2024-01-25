import type { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";

export const withIsSimilarTo = async (
  _req: Request,
  ctx: AppContext,
  product: Product,
) => {
  const id = product.isVariantOf?.productGroupID;

  if (!id) {
    return product;
  }

  const isSimilarTo = await ctx.invoke(
    "vtex/loaders/legacy/relatedProductsLoader.ts",
    {
      crossSelling: "similars",
      id: product.inProductGroupWithID,
    },
  );

  return {
    ...product,
    isSimilarTo: isSimilarTo ?? undefined,
  };
};
