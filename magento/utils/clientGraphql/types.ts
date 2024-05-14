export interface GraphQLProductLeaf {
  canonical_url: string;
  country_of_manufacture: string;
  is_returnable?: string;
  meta_description?: string;
  meta_keyword?: string;
  meta_title?: string;
  name?: string;
  new_from_date?: string;
  new_to_date?: string;
  only_x_left_in_stock?: number;
  options_container?: string;
  rating_summary?: number;
  review_count?: number;
  sku?: string;
  special_price?: number;
  special_to_date?: number;
  staged?: boolean;
  swatch_image?: string;
  uid?: string;
  url_key?: string;
  url_suffix?: string;
}

export type GraphQLShelf = GraphQLProductLeaf;

export interface GraphQLShelfQuery {
  search?: string;
  pageSize?: number;
  currentPage?: number;
}
