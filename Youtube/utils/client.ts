import {
  Query,
  VideoQuery,
  YoutubeChannelResponse,
  YoutubeVideoResponse,
} from "./types.ts";

export interface YoutubeClient {
  "GET /channels": {
    response: YoutubeChannelResponse;
    query: Query;
  };
  "GET /search": {
    response: YoutubeVideoResponse;
    query: VideoQuery;
  };
  "GET /videos": {
    response: YoutubeVideoResponse;
    query: { part: string; id: string };
  };
}
