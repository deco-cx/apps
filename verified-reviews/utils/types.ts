import {
  AggregateRating,
  Review as CommerceReview,
} from "../../commerce/types.ts";

export interface Ratings {
  [key: string]: {
    "rate": string;
    "count": string;
  }[];
}

export interface Review {
  count_helpful_yes: string;
  firstname: string;
  order_ref: string;
  rate: string;
  review: string;
  email: string;
  count_helpful_no: string;
  hide_personnal_data: string;
  lastname: string;
  medias: string;
  order_date: string;
  id_review_product: string;
  review_date: string;
  id_product: string;
  id_review: string;
  sign_helpful: string;
  publish_date: string;
  info1: string;
  info2: string;
  info3: string;
  info4: string;
  info5: string;
  info6: string;
  info7: string;
  info8: string;
  info9: string;
  info10: string;
}

export interface Reviews {
  reviews: Review[];
  status: number[];
}

export interface VerifiedReviewsFullReview {
  aggregateRating?: AggregateRating;
  review: CommerceReview[];
}
