import type { Product } from "../../commerce/types.ts";
import type { Props as OriginalProps } from "../loaders/legacy/relatedProductsLoader.ts";
import relatedProductsLoader from "../loaders/legacy/relatedProductsLoader.ts";
import { AppContext } from "../mod.ts";

type Props = Pick<OriginalProps, "hideUnavailableItems">;

export const withIsSimilarTo = async (
  req: Request,
  ctx: AppContext,
  product: Product,
  props?: Props,
) => {
  const id = product.isVariantOf?.productGroupID;

  if (!id) {
    return product;
  }

  const isSimilarTo = await relatedProductsLoader(
    {
      ...props,
      crossSelling: "similars",
      id: product.isVariantOf!.productGroupID,
    },
    req,
    ctx,
  );

  return {
    ...product,
    isSimilarTo: isSimilarTo ?? undefined,
  };
};
