import type { Product } from "../../commerce/types.ts";
import type { Props as OriginalProps } from "../loaders/legacy/relatedProductsLoader.ts";
import { AppContext } from "../mod.ts";

type Props = Pick<OriginalProps, "hideUnavailableItems">;

export const withIsSimilarTo = async (
  ctx: AppContext,
  product: Product,
  props?: Props,
) => {
  const id = product.isVariantOf?.productGroupID;

  if (!id) {
    return product;
  }

  const isSimilarTo = await ctx.invoke.vtex.loaders.legacy
    .relatedProductsLoader({
      ...props,
      crossSelling: "similars",
      id: product.isVariantOf!.productGroupID,
    });

  return {
    ...product,
    isSimilarTo: isSimilarTo ?? undefined,
  };
};
