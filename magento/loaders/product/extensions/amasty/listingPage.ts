import { AppContext } from "../../../../mod.ts";
import extend, { Props } from "../extend.ts";
import { ProductListingPage } from "../../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../../website/loaders/extension.ts";

/**
 * @title Magento ExtensionOf - Listing Page
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: Omit<Props, "products">,
  req: Request,
  ctx: AppContext,
): ExtensionOf<ProductListingPage | null> =>
async (page: ProductListingPage | null) => {
  if (!page) {
    return page;
  }

  const products = await extend(
    { products: page.products, ...props },
    req,
    ctx,
  );

  return {
    ...page,
    products,
  };
};

export default loader;
