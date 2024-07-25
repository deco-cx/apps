import { ProductDetailsPage } from "../../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../../website/loaders/extension.ts";
import { AppContext } from "../../../../mod.ts";
import { ExtensionProps } from "../../../../utils/client/types.ts";

export const cache = "stale-while-revalidate";

export const cacheKey = (
  props: ExtensionProps,
  req: Request,
  _ctx: AppContext,
) => {
  const url = new URL(req.url);
  return `${url.hostname}${url.pathname}-pdp-liveloPoints:${props.active}-url:${props.path}`;
};

/**
 * @title Magento ExtensionOf Details Page - Livelo Points
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
      .liveloPoints({ products: [page.product], path: props.path });

    return {
      ...page,
      product: product[0],
    };
  }
  return page;
};

export default loader;
