import { Product } from "../../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../../website/loaders/extension.ts";
import { AppContext } from "../../../../mod.ts";
import { ExtensionProps } from "../../../../utils/client/types.ts";

/**
 * @title Magento ExtensionOf Details Page - Amasty Reviews
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: ExtensionProps,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> =>
async (products: Product[] | null) => {
  if (!products || products.length === 0) {
    return products;
  }

  if (props.active) {
    const extendedProducts = await ctx.invoke.magento.loaders.extensions.product
      .reviewsAmasty({ products, path: props.path, from: "SHELF" });

    return extendedProducts;
  }
  return products;
};

export default loader;
