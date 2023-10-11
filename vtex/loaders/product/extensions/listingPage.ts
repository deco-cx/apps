import { ProductListingPage } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { extend, Options } from "../../../utils/extensions/mod.ts";

/**
 * @title VTEX Integration - Extra Info
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: Options,
  req: Request,
  ctx: AppContext,
): ExtensionOf<ProductListingPage | null> =>
async (page: ProductListingPage | null) => {
  if (page == null) {
    return page;
  }

  const products = await extend(page.products, props, req, ctx);

  return {
    ...page,
    products,
  };
};

export default loader;
