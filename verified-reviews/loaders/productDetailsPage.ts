import { AppContext } from "../mod.ts";
import { ProductDetailsPage } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import {
  createClient,
  getProductId,
  getSimilarProductIds,
  PaginationOptions,
} from "../utils/client.ts";
export type Props = PaginationOptions;

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
    const similarProductIds = getSimilarProductIds(productDetailsPage.product);

    const fetchFullReview = async (id: string) => {
      return await client.fullReview({
        productId: id,
        count: config?.count,
        offset: config?.offset,
        order: config?.order,
      });
    };

    const fullReview = await fetchFullReview(productId);
    let combinedReviews = fullReview;

    if (similarProductIds.length > 0 && config.isSimilarTo) {
      const similarReviews = await Promise.all(
        similarProductIds.map(fetchFullReview),
      );

      combinedReviews = {
        ...fullReview,
        review: [
          ...(fullReview.review || []),
          ...similarReviews.flatMap((review) => review.review || []),
        ],
      };
    }

    return {
      ...productDetailsPage,
      product: {
        ...productDetailsPage.product,
        ...combinedReviews,
      },
    };
  };
}
