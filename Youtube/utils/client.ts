import {
  Query,
  UpdateThumbnailResponse,
  VideoQuery,
  YouTubeCaptionListResponse,
  YoutubeCategoryListResponse,
  YoutubeChannelResponse,
  YoutubePlaylistItemsResponse,
  youtubeTokenResponse,
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
  "GET /videoCategories": {
    response: YoutubeCategoryListResponse;
    searchParams: { part: string; regionCode?: string };
    headers: Headers;
  };
  "PUT /videos": {
    response: YoutubeVideoResponse;
    searchParams: { part: string };
    body: {
      id: string;
      snippet?: Record<string, unknown>;
      status?: Record<string, unknown>;
    };
    headers: Headers & { "Content-Type": string };
  };
  "POST /upload/thumbnails/set": {
    response: UpdateThumbnailResponse;
    searchParams: { videoId: string; uploadType: string };
    body: Blob | string;
    headers: Headers & { "Content-Type": string };
  };
  "DELETE /videos": {
    response: void;
    searchParams: {
      id: string;
      onBehalfOfContentOwner?: string;
    };
    headers: Headers;
  };
}

export interface AuthClient {
  "POST /token": {
    response: youtubeTokenResponse;
    searchParams: {
      code: string;
      client_id: string;
      client_secret: string;
      redirect_uri: string;
      grant_type: string;
    };
  };
}
