import {
  SpireAuthorFull,
  SpireBlog,
  SpirePagination,
  SpirePost,
  SpirePostSummary,
  SpireTagWithCount,
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

export interface SpireAuthorsResponse {
  blog: SpireBlog;
  authors: SpireAuthorFull[];
}

export interface SpireAuthorDetailResponse {
  blog: SpireBlog;
  author: SpireAuthorFull;
  posts: SpirePostSummary[];
}

export interface SpireTagsResponse {
  blog: SpireBlog;
  tags: SpireTagWithCount[];
}

export interface SpireTagDetailResponse {
  blog: SpireBlog;
  tag: SpireTagWithCount;
  posts: SpirePostSummary[];
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
  "GET /blog/:account/authors": {
    response: SpireAuthorsResponse;
  };
  "GET /blog/:account/authors/:authorSlug": {
    response: SpireAuthorDetailResponse;
  };
  "GET /blog/:account/tags": {
    response: SpireTagsResponse;
  };
  "GET /blog/:account/tags/:tagSlug": {
    response: SpireTagDetailResponse;
  };
}
