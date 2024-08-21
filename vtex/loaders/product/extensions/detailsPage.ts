import { ProductDetailsPage } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { Props } from "../extend.ts";

/**
 * @title VTEX Integration - Extra Info
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: Omit<Props, "products">,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> =>
async (page: ProductDetailsPage | null) => {
  if (page == null) {
    return page;
  }

  const products = await ctx.invoke(
    "vtex/loaders/product/extend.ts",
    { products: [page.product], ...props },
  );

  return {
    ...page,
    product: products[0],
  };
};

export default loader;
