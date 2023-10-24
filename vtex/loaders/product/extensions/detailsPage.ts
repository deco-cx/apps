import { ProductDetailsPage } from "../../../../commerce/types.ts";
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
): ExtensionOf<ProductDetailsPage | null> =>
async (page: ProductDetailsPage | null) => {
  if (page == null) {
    return page;
  }

  const products = await extend([page.product], props, req, ctx);

  return {
    ...page,
    product: products[0],
  };
};

export default loader;
