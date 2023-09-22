export interface PageReview {
  name: string;
  paging: Paging;
  results: Result[];
}

export interface Paging {
  total_results: number;
  pages_total: number;
  page_size: number;
  current_page_number: number;
  next_page_url: string;
}

export interface Result {
  page_id: string;
  rollup: Rollup;
  reviews: Review[];
}

export interface Review {
  ugc_id: number;
  legacy_id: number;
  review_id: number;
  internal_review_id: number;
  details: Details;
  badges: Badges;
  media: Media[];
  metrics: Metrics;
}

export interface Badges {
  is_staff_reviewer: boolean;
  is_verified_buyer: boolean;
  is_verified_reviewer: boolean;
}

export interface Details {
  comments: string;
  headline: string;
  nickname: string;
  properties: Property[];
  product_name: string;
  location: string;
  created_date: number;
  updated_date: number;
  product_page_id: string;
  brand_base_url: string;
  brand_logo_uri: string;
  brand_name: string;
}

export interface Property {
  key: string;
  label: string;
  type: string;
  value: string[];
}

export interface Metrics {
  helpful_votes: number;
  not_helpful_votes: number;
  rating: number;
  helpful_score: number;
}

export interface Rollup {
  properties: Property[];
  rating_histogram: number[];
  recommended_ratio: number;
  average_rating: number;
  review_count: number;
  media: Media[];
  name: string;
  native_review_count: number;
  syndicated_review_count: number;
}

export interface Media {
  id: string;
  review_id: string;
  uri: string;
  headline: string;
  rating: string;
  helpful_votes: number;
  not_helpful_votes: number;
  type: "image" | "video";
  caption: string;
  nickname: string;
  created_date: number;
}

export interface Property {
  display_type: string;
  key: string;
  name: string;
  type: string;
  values: Value[];
  display_values: string[];
}

export interface Value {
  label: string;
  count: number;
}

export interface ReviewForm {
  merchant_information: MerchantInformation;
  product_information: ProductInformation;
  fields: ReviewFormField[];
  context_information: ContextInformation;
}

export interface ContextInformation {
  review_session_id: string;
  review_start_date: Date;
  product_id: number;
  product_template_id: number;
  image_template_id: number;
  context_hash: number;
}

export interface ReviewFormField {
  id: string;
  field_type: string;
  key: string;
  label?: string;
  required?: boolean;
  input_type?: string;
  answer_type?: string;
  max_length?: number;
  helper_text?: string;
  choices?: Choice[];
  prompt?: string;
  composite_type?: string;
  count?: number;
  fields?: FieldField[];
  value?: string | number;
}

export interface Choice {
  id: string;
  value: string;
}

export interface FieldField {
  id: string;
  field_type: string;
  key: string;
  label: string;
  required: boolean;
  helper_text: string;
  input_type: string;
  answer_type: string;
  choices?: Choice[];
}

export interface MerchantInformation {
  name: string;
  configuration: Configuration;
  return_url: string;
}

export interface Configuration {
  is_live: boolean;
  collect_email: string;
  allow_facebook_connect: boolean;
  allow_post_to_twitter: boolean;
  enable_share_to_amazon: boolean;
  enable_share_to_bestbuy: boolean;
  enable_share_to_coolblue: boolean;
  services_must_agree_with_terms: boolean;
  video_collection_type: string;
  star_styles: string;
  enable_front_end_iovation_validation: boolean;
  enable_enhanced_content_security: boolean;
  allow_post_to_pinterest_war: boolean;
  enable_facebook_integration: boolean;
  enable_instagram_integration: boolean;
  war_minimum_required_characters: number;
  war_minimum_recommended_characters: number;
  ryp_sort_order: string;
  disable_cd4_heading_structures: boolean;
  share_to_retailer_display: string;
  social_measurement_data: string;
  answerbox_enable_pre_question: boolean;
  answerbox_nickname_is_required: boolean;
  answerbox_required_email: boolean;
  enable_rating_only_collection: boolean;
}

export interface ProductInformation {
  name: string;
  full_product_image_urls: FullProductImageUrls;
  full_product_url: string;
  page_id: string;
  locale: string;
  product_lookup_location: string;
}

export interface FullProductImageUrls {
  "100": string;
}

export interface WriteReviewResponse {
  fields: ReviewFormField;
  context_information: ContextInformation;
  status_code: string;
  progressive_info?: {
    is_progressive_type: boolean;
    is_last_stap: false;
    current_step: number;
  };
}
