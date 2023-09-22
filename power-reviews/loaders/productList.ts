import { AppContext } from "../mod.ts";
import { Product } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { toAggregateRating, toPowerReviewId } from "../utils/tranform.ts";

export interface Props {
  /**
   * @title Prop Id
   * @description Which prop in your product is your power review id?
   */
  propId?: "id" | "sku" | "model";

  /**
   * @title Page Size
   * @description Quantity of reviews
   */
  pageSize?: number;
}

/**
 * @title Power Reviews - Product List Page
 */
export default function productListPage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> {
  const { api, merchantId } = ctx;
  const { propId, pageSize = 1 } = props;
  const pageFrom = 0;

  return async (products: Product[] | null) => {
    if (!products) {
      return null;
    }

    const pageIds = products?.map((product) =>
      toPowerReviewId(propId, product)
    );

    const fullReviewsPromises = pageIds.map((pageId) =>
      api["GET /m/:merchantId/l/:locale/product/:pageId/reviews"]({
        merchantId: merchantId,
        locale: "en_US",
        pageId: pageId || "",
        _noconfig: "true",
        image_only: false,
        "paging.from": pageFrom,
        "paging.size": pageSize,
      })
    );

    const fullReviewsResponse = await Promise.all(fullReviewsPromises);

    const fullReviews = await Promise.all(
      fullReviewsResponse.map((review) => review.json()),
    );

    return fullReviews.map((review, idx) => ({
      ...products[idx],
      aggregateRating: toAggregateRating(review.results[0].rollup),
    }));
  };
}
