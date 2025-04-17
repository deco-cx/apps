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

type Headers = {
  Authorization: string;
};

export interface Client {
  "GET /youtube/v3/channels": {
    response: YoutubeChannelResponse;
    searchParams: Query & { id?: string; part: string };
    headers: Headers;
  };

  "GET /channels": {
    response: YoutubeChannelResponse;
    searchParams: Query & { id?: string; part: string };
      headers: Headers;
  };
  "GET /search": {
    response: YoutubeVideoResponse;
    searchParams: VideoQuery;
    headers: Headers;
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
    headers: Headers;
  };
  "GET /captions": {
    response: YouTubeCaptionListResponse;
    searchParams: {
      part: string;
      videoId: string;
    };
    headers: Headers;
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
    headers: Headers;
  };
  "POST /thumbnails/set": {
    response: UpdateThumbnailResponse;
    searchParams: { videoId: string; uploadType: string };
    headers: Headers;
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
