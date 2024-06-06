import { AppContext } from "../../../../mod.ts";
import extend, { Props } from "../extend.ts";
import { ProductDetailsPage } from "../../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../../website/loaders/extension.ts";

/**
 * @title Magento Integration Extension - Details Page
 * @description Add extra data to your loader. This may harm performance
 */
const loader =
  (
    props: Omit<Props, "products">,
    req: Request,
    ctx: AppContext
  ): ExtensionOf<ProductDetailsPage | null> =>
  async (page: ProductDetailsPage | null) => {
    if (!page) {
      return page;
    }

    const products = await extend(
      { products: [page.product], ...props },
      req,
      ctx
    );

    return {
      ...page,
      product: products[0],
    };
  };

export default loader;
