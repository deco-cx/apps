import type { Product } from "../../../../commerce/types.ts";
import type { ExtensionOf } from "../../../../website/loaders/extension.ts";
import type { AppContext } from "../../../mod.ts";
import type { Props } from "../extend.ts";

/**
 * @title VTEX Integration - Extra Info
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: Omit<Props, "products">,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> =>
async (products: Product[] | null) =>
  Array.isArray(products)
    ? await ctx.invoke(
      "vtex/loaders/product/extend.ts",
      { products, ...props },
    )
    : products;

export default loader;
