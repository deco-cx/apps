import { Ratings } from "./types.ts";
import { AggregateRating } from "../../commerce/types.ts";

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
  };
};
