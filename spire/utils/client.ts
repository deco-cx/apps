import {
  SpireBlog,
  SpirePagination,
  SpirePost,
  SpirePostSummary,
} from "../types.ts";

export interface SpireListingResponse {
  blog: SpireBlog;
  posts: SpirePostSummary[];
  pagination: SpirePagination;
}

export interface SpirePostPageResponse {
  blog: SpireBlog;
  post: SpirePost;
}

export interface SpireApi {
  "GET /blog/:account": {
    response: SpireListingResponse;
    searchParams: {
      page?: number;
      perPage?: number;
    };
  };
  "GET /blog/:account/posts/:slug": {
    response: SpirePostPageResponse;
  };
}
