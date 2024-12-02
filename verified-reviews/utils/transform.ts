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

  return {
    "@type": "AggregateRating",
    ratingCount: Number(rating.count),
    ratingValue: Number(parseFloat(rating.rate).toFixed(1)),
    reviewCount: Number(rating.count),
    bestRating: MAX_RATING_VALUE,
    worstRating: MIN_RATING_VALUE,
  };
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
