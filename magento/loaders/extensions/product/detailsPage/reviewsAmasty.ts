import { ProductDetailsPage } from "../../../../../commerce/types.ts";
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
): ExtensionOf<ProductDetailsPage | null> =>
async (page: ProductDetailsPage | null) => {
  if (!page) {
    return page;
  }

  if (props.active) {
    const product = await ctx.invoke.magento.loaders.extensions.product
      .reviewsAmasty({
        products: [page.product],
        path: props.path,
        from: "PDP",
      });

    return {
      ...page,
      product: product[0],
    };
  }
  return page;
};

export default loader;
