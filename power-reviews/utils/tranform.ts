import { Product } from "../../commerce/types.ts";
import { Review, Rollup } from "./types.ts";

export const toReview = (review: Review) => {
  const date = new Date(review.details.created_date);
  const formatedDate = date.getFullYear() + "-" +
    (date.getMonth() + 1) + "-" + (date.getDate());
  const pros = review.details.properties.find((prop) => prop.key == "pros")
    ?.value;
  const cons = review.details.properties.find((prop) => prop.key == "cons")
    ?.value;
  return {
    "@type": "Review" as const,
    id: review.internal_review_id.toString(),
    author: [
      {
        "@type": "Author" as const,
        name: `${review.details.nickname}`,
        verifiedBuyer: review.badges.is_verified_buyer,
        location: review.details.location,
      },
    ],
    datePublished: formatedDate,
    itemReviewed: review.details.product_name,
    negativeNotes: cons,
    positiveNotes: pros,
    reviewHeadline: review.details.headline,
    reviewBody: review.details.comments,
    reviewRating: {
      "@type": "AggregateRating" as const,
      ratingValue: review.metrics.rating,
    },
    tags: review.details.properties.map((props) => ({
      label: props.label,
      value: props.value,
    })),
    brand: {
      name: review.details.brand_name,
      logo: review.details.brand_logo_uri,
      url: review.details.brand_base_url,
    },
    media: review.media?.map((media) => ({
      type: media.type,
      url: media.uri,
      alt: media.id,
      likes: media.helpful_votes,
      unlikes: media.not_helpful_votes,
    })),
  };
};

export const toAggregateRating = (rollup: Rollup) => {
  if (!rollup) {
    return {
      "@type": "AggregateRating" as const,
      ratingValue: 0,
      ratingCount: 0,
    };
  }
  return {
    "@type": "AggregateRating" as const,
    ratingValue: rollup?.average_rating || 0,
    ratingCount: rollup?.review_count || 0,
  };
};

export const toPowerReviewId = (prop: string | undefined, product: Product) => {
  if (prop == "sku") {
    return product.sku;
  }

  if (prop == "model") {
    return product.isVariantOf?.model;
  }

  return product.productID;
};
