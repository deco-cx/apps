import { ReviewPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toAggregateRating, toReview } from "../utils/tranform.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
export interface Props {
  slug?: RequestURLParam;

  /**
   * @title Page Id
   * @description id configured at power reviews
   */
  pageId?: string;

  /**
   * @title Image Only
   * @description Filter only reviews with media
   */
  image_only?: boolean;

  /**
   * @title Page From
   * @description Number to start
   */
  pageFrom?: number;

  /**
   * @title Page Size
   * @description Quantity of reviews
   */
  pageSize?: number;

  /**
   * @title Sort
   */
  sort?: string;

  /**
   * @title Sort
   */
  filters?: string;
}

/**
 * @title Power Reviews
 */
export default async function getReviewProduct(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReviewPage | null> {
  const { api, merchantId } = ctx;
  const {
    slug,
    pageId,
    pageFrom = 0,
    pageSize = 10,
    image_only = false,
    sort,
    filters,
  } = props;

  const id = slug || pageId;

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
      sort: sort,
      filters: filters,
    });

  const fullReview = await fullReviewResponse.json();
  const rollup = fullReview.results[0].rollup;
  const reviews = fullReview.results[0].reviews;

  const aggregateRating = toAggregateRating(rollup);

  const review = reviews.length >= 1
    ? reviews?.map((item) => toReview(item))
    : undefined;

  return {
    page: {
      currentPageNumber: fullReview.paging.current_page_number,
      nextPageUrl: fullReview.paging.next_page_url,
      pageSize: fullReview.paging.page_size,
      pagesTotal: fullReview.paging.pages_total,
      totalResults: fullReview.paging.total_results,
    },
    id: id,
    review,
    aggregateRating,
  };
}
