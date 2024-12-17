import { AppContext } from "../mod.ts";
import { ProductDetailsPage } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import {
  createClient,
  getProductId,
  PaginationOptions,
} from "../utils/client.ts";

export type Props = PaginationOptions & {
  aggregateSimilarProducts?: boolean;
};

/**
 * @title Opiniões verificadas - Full Review for Product (Ratings and Reviews)
 */
export default function productDetailsPage(
  config: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> {
  const client = createClient({ ...ctx });

  return async (productDetailsPage: ProductDetailsPage | null) => {
    if (!productDetailsPage || !client) {
      return null;
    }

    const productId = getProductId(productDetailsPage.product);
    let productsToGetReviews = [productId];

    if (config.aggregateSimilarProducts) {
      productsToGetReviews = [
        productId,
        ...productDetailsPage.product.isSimilarTo?.map(getProductId) ?? [],
      ];
    }

    const fullReview = await client.fullReview({
      productId: productsToGetReviews,
      count: config?.count,
      offset: config?.offset,
      order: config?.order,
    });

    return {
      ...productDetailsPage,
      product: {
        ...productDetailsPage.product,
        ...fullReview,
      },
    };
  };
}
