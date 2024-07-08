import { AppContext } from "../../../mod.ts";
import { ProductDetailsPage } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { liveloExt, reviewsExt } from "../../../utils/extensionsUtils.ts";
import { ExtensionProps } from "../../../utils/client/types.ts";

export interface Props {
  reviews?: ExtensionProps;
  liveloPoints?: ExtensionProps;
}

/**
 * @title Magento Extension - Product Details Page
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  { reviews, liveloPoints }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> =>
async (page: ProductDetailsPage | null) => {
  if (!page) {
    return page;
  }

  let product = page.product;

  if (reviews?.active) {
    product = await reviewsExt([product], reviews.path, ctx).then((p) => p[0]);
  }

  if (liveloPoints?.active) {
    product = await liveloExt([product], liveloPoints.path, ctx).then((p) =>
      p[0]
    );
  }

  return {
    ...page,
    product,
  };
};

export default loader;
