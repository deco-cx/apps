export interface ReviewsAmastyAPI {
  success: boolean;
  message: string;
  reviews: ReviewAmasty[];
  summary: Summary;
}

export interface ReviewAmasty {
  review_id: number;
  title: string;
  detail: string;
  nickname: string;
  created_at: string;
  verified_buyer: boolean;
  review_stars: number;
  review_stars_percentage: number;
}

export interface Summary {
  reviews_count: number;
}

export interface SubmitReviewAmastyAPI {
  success: boolean
  message: string
  reviews: ReviewAmasty[] | null
  summary: Summary | null
}

export interface SubmitReviewAmastyBody {
  product_id: number
  customer_id: number
  store_id: string
  nickname: string
  title: string
  detail: string
  ratings: Ratings
}

export interface Ratings {
  [key: string]: string
}