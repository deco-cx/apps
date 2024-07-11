import { AppContext } from "../../../mod.ts";
import { ProductListingPage } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { liveloExt, reviewsExt } from "../../../utils/extension.ts";
import { ExtensionProps } from "../../../utils/client/types.ts";

export interface Props {
  reviews?: ExtensionProps;
  liveloPoints?: ExtensionProps;
}

/**
 * @title Magento ExtensionOf - Product Listing Page
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  { reviews, liveloPoints }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductListingPage | null> =>
async (page: ProductListingPage | null) => {
  if (!page) {
    return page;
  }

  let p = page.products;

  if (reviews?.active) {
    p = await reviewsExt(p, reviews.path, ctx);
  }

  if (liveloPoints?.active) {
    p = await liveloExt(p, liveloPoints.path, ctx);
  }

  return {
    ...page,
    products: p,
  };
};

export default loader;
