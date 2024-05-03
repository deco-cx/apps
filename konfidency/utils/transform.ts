import type { PDPReview } from "./types.ts";
import type { AggregateRating, Review } from "../../commerce/types.ts";

const MAX_RATING_VALUE = 5;
const MIN_RATING_VALUE = 0;

export const toReview = (
  ProductReviews: PDPReview["reviews"][0],
): { aggregateRating: AggregateRating; review: Review[] } => {
  const review = ProductReviews.reviews.map((
    { _id: id, name, verified, created, text, rating },
  ) =>
    ({
      "@type": "Review",
      id,
      author: [{ "@type": "Author", name, verifiedBuyer: verified }],
      datePublished: created,
      reviewBody: text,
      reviewRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: 1,
      },
    }) as Review
  );

  return {
    review,
    aggregateRating: {
      "@type": "AggregateRating",
      reviewCount: ProductReviews.reviewCount,
      ratingValue: ProductReviews.aggregateRating,
      bestRating: MAX_RATING_VALUE,
      worstRating: MIN_RATING_VALUE,
    },
  };
};
