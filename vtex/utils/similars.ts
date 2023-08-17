import type { Product } from "apps/commerce/types.ts";
import { AppContext } from "apps/vtex/mod.ts";
import type { Props as OriginalProps } from "../loaders/legacy/relatedProductsLoader.ts";

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

  const isSimilarTo = await ctx.invoke(
    "apps/vtex/loaders/legacy/relatedProductsLoader.ts",
    {
      ...props,
      crossSelling: "similars",
      id: product.isVariantOf!.productGroupID,
    },
  );

  return {
    ...product,
    isSimilarTo: isSimilarTo ?? undefined,
  };
};
