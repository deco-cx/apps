import {
  Query,
  UpdateThumbnailResponse,
  VideoQuery,
  YouTubeCaptionListResponse,
  YoutubeChannelResponse,
  YoutubePlaylistItemsResponse,
  YoutubeTokenResponse,
  YoutubeVideoListResponse,
  YoutubeVideoResponse,
} from "./types.ts";

export interface Client {
  "GET /youtube/v3/channels": {
    response: YoutubeChannelResponse;
    searchParams: Query & { id?: string; part: string };
    headers: {
      Authorization: string;
    };
  };

  "GET /channels": {
    response: YoutubeChannelResponse;
    searchParams: Query & { id?: string; part: string };
    headers: {
      Authorization: string;
    };
  };
  "GET /search": {
    response: YoutubeVideoResponse;
    searchParams: VideoQuery;
    headers: {
      Authorization: string;
    };
  };
  "GET /videos": {
    response: YoutubeVideoListResponse;
    searchParams: { part: string; id: string };
    headers: {
      Authorization: string;
    };
  };
  "GET /playlistItems": {
    response: YoutubePlaylistItemsResponse;
    searchParams: {
      part: string;
      playlistId: string;
      maxResults?: number;
      pageToken?: string;
    };
    headers: {
      Authorization: string;
    };
  };
  "GET /captions": {
    response: YouTubeCaptionListResponse;
    searchParams: {
      part: string;
      videoId: string;
    };
    headers: {
      Authorization: string;
    };
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
    };
  };
  "POST /thumbnails/set": {
    response: UpdateThumbnailResponse;
    searchParams: { videoId: string; uploadType: string };
    headers: {
      Authorization: string;
    };
  };
}

export interface AuthClient {
  "POST /token": {
    response: YoutubeTokenResponse;
    searchParams: {
      code: string;
      client_id: string;
      client_secret: string;
      redirect_uri: string;
      grant_type: string;
    };
  };
}
