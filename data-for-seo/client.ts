// Keywords Data Types
export interface KeywordData {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  competition_level: string;
  monthly_searches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
}

export interface RelatedKeyword {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  keyword_difficulty: number;
  relevance: number;
}

// SERP Types
export interface MapsResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  title: string;
  rating?: {
    value: number;
    votes_count: number;
    rating_max: number;
  };
  price_level?: string;
  category?: string;
  phone?: string;
  address?: string;
  website?: string;
  domain?: string;
  place_id: string;
  cid: string;
  latitude: number;
  longitude: number;
  is_closed?: boolean;
  is_temporarily_closed?: boolean;
  is_claimed?: boolean;
  work_hours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
}

export interface SerpItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  breadcrumb?: string;
  is_paid?: boolean;
  rating?: {
    value: number;
    votes_count: number;
  };
}

export interface GoogleAd {
  type: string;
  rank_group: number;
  rank_absolute: number;
  advertiser_id: string;
  creative_id: string;
  title: string;
  description: string;
  url: string;
  domain: string;
  breadcrumb: string;
  is_mobile: boolean;
  phone?: string;
}

export interface FeaturedSnippet {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  featured_snippet_type: string;
}

// Backlinks Types
export interface BacklinksOverview {
  target: string;
  total_backlinks: number;
  total_pages: number;
  total_domains: number;
  broken_backlinks: number;
  broken_pages: number;
  referring_domains: number;
  referring_main_domains: number;
  referring_ips: number;
  referring_subnets: number;
  referring_pages: number;
  dofollow: number;
  nofollow: number;
  gov_domains: number;
  edu_domains: number;
  rank: number;
  main_domain_rank: number;
  last_updated_time: string;
}

export interface Backlink {
  type: string;
  domain_from: string;
  url_from: string;
  url_from_https: boolean;
  domain_to: string;
  url_to: string;
  url_to_https: boolean;
  tld_from: string;
  is_new: boolean;
  is_lost: boolean;
  backlink_spam_score: number;
  rank: number;
  page_from_rank: number;
  domain_from_rank: number;
  domain_from_external_links: number;
  domain_from_internal_links: number;
  page_from_external_links: number;
  page_from_internal_links: number;
  page_from_size: number;
  page_from_encoding: string;
  page_from_language: string;
  page_from_title: string;
  page_from_status_code: number;
  first_seen: string;
  prev_seen: string;
  last_seen: string;
  item_type: string;
  dofollow: boolean;
  anchor?: string;
  text_from?: string;
  alt?: string;
  image_url?: string;
}

export interface AnchorText {
  anchor: string;
  total: number;
  dofollow: number;
  referring_domains: number;
  referring_domains_dofollow: number;
  referring_main_domains: number;
  referring_main_domains_dofollow: number;
  referring_pages: number;
  referring_pages_dofollow: number;
  rank: number;
}

export interface ReferringDomain {
  type: string;
  domain: string;
  rank: number;
  backlinks: number;
  dofollow: number;
  first_seen: string;
  lost_date?: string;
  backlinks_spam_score: number;
  broken_backlinks: number;
  broken_pages: number;
  referring_domains: number;
  referring_domains_dofollow: number;
  referring_main_domains: number;
  referring_main_domains_dofollow: number;
  referring_pages: number;
  referring_pages_dofollow: number;
}

// Traffic Analytics Types
export interface TrafficOverview {
  target: string;
  date: string;
  rank: number;
  visits: number;
  unique_visitors: number;
  pages_per_visit: number;
  avg_visit_duration: number;
  bounce_rate: number;
  users_expected_visits_rate: number;
}

// Task Management Types
export interface TaskInfo {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  result_count: number;
  path: string[];
  data: unknown;
  tag?: string;
}

export interface TasksReadyResponse {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: TaskInfo[];
}

// News Result Types
export interface NewsResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  title: string;
  url: string;
  source: string;
  domain: string;
  snippet: string;
  timestamp: string;
  time_ago?: string;
  amp_version?: boolean;
  rating?: {
    value: number;
    votes_count: number;
  };
  highlighted?: string[];
}

// Events Result Types
export interface EventResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  title: string;
  description: string;
  url: string;
  image_url?: string;
  event_dates?: {
    start_datetime?: string;
    end_datetime?: string;
    displayed_dates?: string;
  };
  location_info?: {
    name?: string;
    address?: string;
    url?: string;
    cid?: string;
    latitude?: number;
    longitude?: number;
  };
  ticket_info?: {
    price?: string;
    price_range?: string;
    price_currency?: string;
    source?: string;
    url?: string;
  };
}

// Dataset Search Result Types
export interface DatasetResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  dataset_id: string;
  title: string;
  snippet: string;
  provider_name: string;
  formats?: string[];
  authors?: string[];
  licenses?: string[];
  updated_date?: string;
  area_covered?: string[];
  dataset_description?: {
    text?: string;
    links?: Array<{
      text: string;
      url: string;
    }>;
  };
  links?: Array<{
    text: string;
    url: string;
  }>;
}

export interface TrafficBySource {
  direct: number;
  search_organic: number;
  search_paid: number;
  referral: number;
  social: number;
  mail: number;
  display_ad: number;
}

export interface TrafficByCountry {
  country: string;
  country_code: string;
  visits: number;
  visits_percentage: number;
}

export interface TrafficByPage {
  page: string;
  visits: number;
  visits_percentage: number;
  unique_visitors: number;
  page_views: number;
  avg_time_on_page: number;
  bounce_rate: number;
  exit_rate: number;
}

// API Request/Response Types
export interface DataForSeoTaskRequest {
  id?: string;
  data?: unknown;
  postback_url?: string;
  pingback_url?: string;
  tag?: string;
}

export interface DataForSeoTaskResponse {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: Array<{
    id: string;
    status_code: number;
    status_message: string;
    time: string;
    cost: number;
    result_count: number;
    path: string[];
    data: unknown;
    result?: unknown[];
  }>;
}

// Client Interface
export interface DataForSeoClient {
  // Keywords Data API
  "POST /keywords_data/google/search_volume/task_post": {
    body: Array<{
      keywords: string[];
      language_name?: string;
      location_name?: string;
      language_code?: string;
      location_code?: number;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /keywords_data/google/related_keywords/task_post": {
    body: Array<{
      keywords: string[];
      language_name?: string;
      location_name?: string;
      language_code?: string;
      location_code?: number;
      depth?: number;
      include_seed_keyword?: boolean;
      include_serp_info?: boolean;
      limit?: number;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /keywords_data/google/ads_competition/task_post": {
    body: Array<{
      keywords: string[];
      language_name?: string;
      location_name?: string;
      language_code?: string;
      location_code?: number;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  // SERP API
  "POST /serp/google/organic/task_post": {
    body: Array<{
      keyword: string;
      language_name?: string;
      location_name?: string;
      language_code?: string;
      location_code?: number;
      device?: "desktop" | "mobile";
      os?: string;
      depth?: number;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /serp/google/organic/live/advanced": {
    body: Array<{
      keyword: string;
      language_code?: string;
      location_code?: number;
      device?: "desktop" | "mobile";
      os?: "windows" | "macos";
      depth?: number;
      load_serp_features?: boolean;
      calculate_rectangles?: boolean;
      browser_screen_width?: number;
      browser_screen_height?: number;
      browser_screen_resolution_ratio?: number;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /serp/google/ads/task_post": {
    body: Array<{
      keyword: string;
      language_name?: string;
      location_name?: string;
      language_code?: string;
      location_code?: number;
      device?: "desktop" | "mobile";
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /serp/google/maps/task_post": {
    body: Array<{
      keyword: string;
      language_name?: string;
      location_name?: string;
      language_code?: string;
      location_code?: number;
      device?: "desktop" | "mobile";
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  // Backlinks API
  "POST /backlinks/domain_info/live": {
    body: Array<{
      target: string;
      limit?: number;
      offset?: number;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /backlinks/backlinks/live": {
    body: Array<{
      target: string;
      limit?: number;
      offset?: number;
      filters?: string[];
      order_by?: string[];
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /backlinks/anchors/live": {
    body: Array<{
      target: string;
      limit?: number;
      offset?: number;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /backlinks/referring_domains/live": {
    body: Array<{
      target: string;
      limit?: number;
      offset?: number;
      filters?: string[];
      order_by?: string[];
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  // Traffic Analytics API
  "POST /traffic_analytics/overview/live": {
    body: Array<{
      target: string;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /traffic_analytics/by_source/live": {
    body: Array<{
      target: string;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /traffic_analytics/by_country/live": {
    body: Array<{
      target: string;
      limit?: number;
      offset?: number;
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /traffic_analytics/by_pages/live": {
    body: Array<{
      target: string;
      limit?: number;
      offset?: number;
      filters?: string[];
      order_by?: string[];
      tag?: string;
    }>;
    response: DataForSeoTaskResponse;
  };

  // Task Result Endpoints
  "GET /keywords_data/google/search_volume/task_get/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  "GET /keywords_data/google/related_keywords/task_get/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  "GET /keywords_data/google/ads_competition/task_get/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  "GET /serp/google/organic/task_get/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  "GET /serp/google/ads/task_get/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  "GET /serp/google/maps/task_get/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  // Task Management Endpoints
  "GET /serp/google/organic/tasks_ready": {
    response: TasksReadyResponse;
  };

  "GET /serp/google/organic/tasks_fixed": {
    response: TasksReadyResponse;
  };

  "GET /serp/google/organic/task_get/regular/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  "GET /serp/google/organic/task_get/advanced/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  "GET /serp/google/organic/task_get/html/:id": {
    response: DataForSeoTaskResponse;
    "id": string;
  };

  // News, Events and Dataset Search Endpoints
  "POST /serp/google/news/live/advanced": {
    body: Array<{
      keyword: string;
      language_code?: string;
      location_code?: number;
      device?: "desktop" | "mobile";
      os?: "windows" | "macos";
      depth?: number;
      sort_by?: "relevance" | "date";
      time_range?: "all" | "1h" | "1d" | "1w" | "1m" | "1y";
      load_serp_features?: boolean;
      calculate_rectangles?: boolean;
      browser_screen_width?: number;
      browser_screen_height?: number;
      browser_screen_resolution_ratio?: number;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /serp/google/events/live/advanced": {
    body: Array<{
      keyword: string;
      location_name?: string;
      location_coordinate?: string;
      language_code?: string;
      date_range?: string;
      os?: "windows" | "macos";
      depth?: number;
      load_serp_features?: boolean;
      calculate_rectangles?: boolean;
      browser_screen_width?: number;
      browser_screen_height?: number;
      browser_screen_resolution_ratio?: number;
    }>;
    response: DataForSeoTaskResponse;
  };

  "POST /serp/google/dataset_search/live/advanced": {
    body: Array<{
      keyword: string;
      last_updated?: string;
      file_formats?: string[];
      usage_rights?: string;
      is_free?: boolean;
      topics?: string[];
      language_code?: string;
      depth?: number;
      load_serp_features?: boolean;
      calculate_rectangles?: boolean;
      browser_screen_width?: number;
      browser_screen_height?: number;
      browser_screen_resolution_ratio?: number;
    }>;
    response: DataForSeoTaskResponse;
  };
}
