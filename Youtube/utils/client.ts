import {
  Query,
  UpdateThumbnailResponse,
  VideoQuery,
  YoutubeChannelResponse,
  YoutubeVideoResponse,
  YouTubeCaptionListResponse,
} from "./types.ts";

export interface YoutubeClient {
  "GET /channels": {
    response: YoutubeChannelResponse;
    searchParams: Query & { id?: string, part: string };
    headers: {
      Authorization: string;
    }
  };
  "GET /search": {
    response: YoutubeVideoResponse;
    searchParams: VideoQuery;
    headers: {
      Authorization: string;
    }
  };
  "GET /videos": {
    response: YoutubeVideoResponse;
    searchParams: { part: string; id: string };
    headers: {
      Authorization: string;
    }
  };
  "GET /playlistItems": {
    response: YoutubeVideoResponse;
    searchParams: { 
      part: string; 
      playlistId: string;
      maxResults?: number;
      pageToken?: string;
    };
    headers: {
      Authorization: string;
    }
  };
  "GET /captions": {
    response: YouTubeCaptionListResponse;
    searchParams: { 
      part: string; 
      videoId: string;
    };
    headers: {
      Authorization: string;
    }
  };
  "GET /captions/:id": {
    response: string;
    pathParams: {
      id: string;
    };
    searchParams: { 
      tfmt?: "srt" | "sbv" | "vtt";
      tlang?: string; 
    };
    headers: {
      Authorization: string;
    }
  };
  "POST /thumbnails/set": {
    response: UpdateThumbnailResponse;
    searchParams: { videoId: string; uploadType: string };
    headers: {
      Authorization: string;
    }
  };
}
