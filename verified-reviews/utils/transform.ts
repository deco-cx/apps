import {
  AggregateRating,
  Review as CommerceReview,
} from "../../commerce/types.ts";
import { Ratings, Review } from "./types.ts";

const MAX_RATING_VALUE = 5;
const MIN_RATING_VALUE = 0;

export const getRatingProduct = ({
  ratings,
  productId,
}: {
  ratings: Ratings | undefined;
  productId: string;
}): AggregateRating | undefined => {
  const rating = ratings?.[productId]?.[0];

  if (!rating) {
    return undefined;
  }

  const aggregateRating: AggregateRating = {
    "@type": "AggregateRating",
    ratingCount: Number(rating.count),
    ratingValue: Number(parseFloat(rating.rate).toFixed(1)),
    bestRating: MAX_RATING_VALUE,
    worstRating: MIN_RATING_VALUE,
  };

  return aggregateRating;
};

export const getWeightedRatingProduct = (
  ratings: Ratings | undefined,
): AggregateRating | undefined => {
  if (!ratings) {
    return undefined;
  }

  const { weightedRating, totalRatings } = Object.entries(ratings ?? {}).reduce(
    (acc, [_, [ratingDetails]]) => {
      const count = Number(ratingDetails.count);
      const value = Number(parseFloat(ratingDetails.rate).toFixed(1));

      acc.totalRatings += count;
      acc.weightedRating += count * value;

      return acc;
    },
    { weightedRating: 0, totalRatings: 0 },
  );

  const aggregateRating: AggregateRating = {
    "@type": "AggregateRating",
    ratingCount: totalRatings,
    reviewCount: totalRatings,
    ratingValue: totalRatings > 0
      ? Number((weightedRating / totalRatings).toFixed(1))
      : 0,
    bestRating: MAX_RATING_VALUE,
    worstRating: MIN_RATING_VALUE,
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
  dateCreated: review.order_date,
  reviewRating: {
    "@type": "AggregateRating",
    ratingValue: Number(review.rate),
    // this api does not support multiple reviews
    reviewCount: 1,
  },
});
