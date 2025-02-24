import { Query, YoutubeChannelResponse, YoutubeVideoResponse } from "./types.ts";

export interface YoutubeClient {
  "GET /channels": {
    response: YoutubeChannelResponse,
    query: Query,
  };
  "POST /videos": {
    response: YoutubeVideoResponse,
  };
}
