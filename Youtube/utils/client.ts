import {
  Query,
  VideoQuery,
  YoutubeChannelResponse,
  YoutubeVideoResponse,
  UpdateThumbnailResponse,
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
  "POST /thumbnails/set": {
    response: UpdateThumbnailResponse;
    query: { videoId: string; uploadType: string };
  };
}
