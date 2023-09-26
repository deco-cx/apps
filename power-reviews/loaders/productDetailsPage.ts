import { AppContext } from "../mod.ts";
import { ProductDetailsPage } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import {
  toAggregateRating,
  toPowerReviewId,
  toReview,
} from "../utils/tranform.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";

export interface Props {
  slug?: RequestURLParam;

  /**
   * @title Prop Id
   * @description Which prop in your product is your power review id?
   */
  propId?: "id" | "sku" | "model";

  /**
   * @title Image Only
   * @description Filter only reviews with media
   */
  image_only?: boolean;
}

/**
 * @title Power Reviews - Product Details Page
 */
export default function productDetailsPage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> {
  const { api, merchantId } = ctx;
  const pageFrom = 0, pageSize = 10;
  const { image_only = false, slug, propId } = props;

  return async (productDetailsPage: ProductDetailsPage | null) => {
    if (!productDetailsPage) {
      return null;
    }

    const id = slug || toPowerReviewId(propId, productDetailsPage.product);

    if (!id) {
      return null;
    }

    const fullReviewResponse = await api
      ["GET /m/:merchantId/l/:locale/product/:pageId/reviews"]({
        merchantId: merchantId,
        locale: "en_US",
        pageId: id,
        _noconfig: "true",
        image_only: image_only,
        "paging.from": pageFrom,
        "paging.size": pageSize,
      });

    const fullReview = await fullReviewResponse.json();
    const rollup = fullReview.results[0].rollup;
    const reviews = fullReview.results[0].reviews;

    const aggregateRating = toAggregateRating(rollup);

    const review = reviews.length >= 1
      ? reviews?.map((item) => toReview(item))
      : undefined;

    return {
      ...productDetailsPage,
      product: {
        ...productDetailsPage.product,
        review,
        aggregateRating,
      },
    };
  };
}
