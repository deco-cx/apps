import {
  AggregateRating,
  Review as CommerceReview,
} from "../../commerce/types.ts";
import { Ratings, Review } from "./types.ts";

export const getRatingProduct = (
  ratings: Ratings | undefined,
): AggregateRating | undefined => {
  if (!ratings) {
    return undefined;
  }

  let weightedRating = 0;
  let totalRatings = 0;

  Object.entries(ratings ?? {}).forEach(([_, [rating]]) => {
    const count = Number(rating.count);
    const value = Number(parseFloat(rating.rate).toFixed(1));

    totalRatings += count;
    weightedRating += count * value;
  });

  const aggregateRating: AggregateRating = {
    "@type": "AggregateRating",
    ratingCount: totalRatings,
    reviewCount: totalRatings,
    ratingValue: totalRatings > 0
      ? Number((weightedRating / totalRatings).toFixed(1))
      : 0,
  };

  return aggregateRating;
};

export const toReview = (review: Review): CommerceReview => ({
  "@type": "Review",
  author: [
    {
      "@type": "Author",
      name: `${review.firstname} ${review.lastname}`,
    },
  ],
  datePublished: review.review_date,
  reviewBody: review.review,
  reviewRating: {
    "@type": "AggregateRating",
    ratingValue: Number(review.rate),
    // this api does not support multiple reviews
    reviewCount: 1,
  },
});
