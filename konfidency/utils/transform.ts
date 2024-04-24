import type { PDPReview } from "./types.ts";
import type { AggregateRating, Review } from "../../commerce/types.ts";

const MAX_RATING_VALUE = 5;
const MIN_RATING_VALUE = 0;

const getBestAndWorstReview = (array: PDPReview["reviews"][0]["reviews"]) => {
  if (!array || array.length === 0) {
    return { bestRating: MIN_RATING_VALUE, worstRating: MIN_RATING_VALUE };
  }

  const { bestRating, worstRating } = array.reduce((acc, curr) => {
    if (curr.rating > acc.bestRating) {
      acc.bestRating = curr.rating;
    }
    if (curr.rating < acc.worstRating) {
      acc.worstRating = curr.rating;
    }
    return acc;
  }, { bestRating: MIN_RATING_VALUE, worstRating: MAX_RATING_VALUE });

  return { bestRating, worstRating };
};

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

  const { bestRating, worstRating } = getBestAndWorstReview(
    ProductReviews.reviews,
  );

  return {
    review,
    aggregateRating: {
      "@type": "AggregateRating",
      reviewCount: ProductReviews.reviewCount,
      ratingValue: ProductReviews.aggregateRating,
      bestRating,
      worstRating,
    },
  };
};
