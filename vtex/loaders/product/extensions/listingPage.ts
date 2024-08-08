import type { ProductListingPage } from "../../../../commerce/types.ts";
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
): ExtensionOf<ProductListingPage | null> =>
async (page: ProductListingPage | null) => {
  if (page == null) {
    return page;
  }

  const products = await ctx.invoke(
    "vtex/loaders/product/extend.ts",
    { products: page.products, ...props },
  );

  return {
    ...page,
    products,
  };
};

export const cache = "no-cache";

export default loader;
