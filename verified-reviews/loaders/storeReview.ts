// deno-lint-ignore-file
import { AppContext } from "../mod.ts";
import { Review } from "../../commerce/types.ts";
import { createClient } from "../utils/client.ts";

export type Props = {
  /**
   * @title Number of reviews 
   */
  limit: number;
};

/**
 * @title Opiniões verificadas - Full Review for Store (Ratings and Reviews)
 */
export default async function storeReview(
  _config: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Review[] | null> {
  const client = createClient({ ...ctx });

  if (!client) {
    return null;
  }

  const reviews = await client.storeReview();

  if (!reviews) {
    return null;
  }

  let formatReviews: Review[];
  
  formatReviews = reviews.map((item) => ({
    "@type": "Review",
    author: [
      {
        "@type": "Author",
        name: `${item.firstname} ${item.lastname}`,
      },
    ],
    datePublished: item.review_date,
    reviewBody: item.review,
    reviewRating: {
      "@type": "AggregateRating",
      ratingValue: Number(item.rate),
    },
  }))

  const limitedReviews = formatReviews.slice(0, _config.limit);

  return limitedReviews;
}
