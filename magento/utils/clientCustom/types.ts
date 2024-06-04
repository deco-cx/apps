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
