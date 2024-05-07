import { logger } from "deco/mod.ts";
import { ProductDetailsPage } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { AppContext } from "../mod.ts";
import { toReview } from "../utils/transform.ts";

export interface Props {
  /**
   * @description The default value is 5
   */
  pageSize?: number;
  /**
   * @description The default value is 1
   */
  page?: number;
}

export default function productDetailsPage(
  { pageSize = 5, page = 1 }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> {
  const { api, customer } = ctx;
  return async (productDetailsPage: ProductDetailsPage | null) => {
    if (!productDetailsPage) {
      return null;
    }

    try {
      const reviews = await api["GET /:customer/:sku/summary"]({
        customer,
        page,
        pageSize,
        sku: productDetailsPage.product.inProductGroupWithID as string,
      }).then((res) => res.json());
      const { aggregateRating, review } = toReview(reviews.reviews[0]);

      return {
        ...productDetailsPage,
        product: {
          ...productDetailsPage.product,
          aggregateRating,
          review,
        },
      };
    } catch (error) {
      logger.error(`{ errorName: ${error.name},  
      errorMessage: ${error.message} }`);
      return productDetailsPage;
    }
  };
}
