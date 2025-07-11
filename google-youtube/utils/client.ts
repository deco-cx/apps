import {
  LiveBroadcast,
  LiveBroadcastListResponse,
  LiveStream,
  LiveStreamListResponse,
  Query,
  UpdateThumbnailResponse,
  VideoQuery,
  YouTubeCaptionListResponse,
  YoutubeCategoryListResponse,
  YoutubeChannelResponse,
  YouTubeCommentThreadListResponse,
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
    headers: Headers;
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
  };
  "GET /captions/:id": {
    response: string;
    searchParams: {
      tfmt?: "sbv" | "scc" | "srt" | "ttml" | "vtt";
      tlang?: string;
      onBehalfOfContentOwner?: string;
    };
  };
  "GET /commentThreads": {
    response: YouTubeCommentThreadListResponse;
    searchParams: {
      part: string;
      videoId: string;
      maxResults?: number;
      order?: "time" | "relevance";
      pageToken?: string;
    };
    headers: Headers;
  };
  "GET /liveBroadcasts": {
    response: LiveBroadcastListResponse;
    searchParams: {
      part: string;
      id?: string;
      mine?: boolean;
      channelId?: string;
      broadcastStatus?: "all" | "active" | "completed" | "upcoming";
      maxResults?: number;
      pageToken?: string;
      orderBy?: "startTime" | "viewCount";
    };
    headers: Headers;
  };
  "GET /liveStreams": {
    response: LiveStreamListResponse;
    searchParams: {
      part: string;
      id?: string;
      mine?: boolean;
      maxResults?: number;
      pageToken?: string;
    };
    headers: Headers;
  };
  "POST /thumbnails/set": {
    response: UpdateThumbnailResponse;
    searchParams: { videoId: string; uploadType: string };
    headers: Headers & { "Content-Type": string };
    body: string | Blob;
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
  "PUT /channels": {
    response: YoutubeChannelResponse;
    searchParams: { part: string };
    body: {
      id: string;
      snippet?: Record<string, unknown>;
      brandingSettings?: Record<string, unknown>;
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
  "GET /channelSections": {
    response: unknown;
    searchParams: {
      part: string;
      mine?: boolean;
      id?: string;
    };
    headers: Headers;
  };
  "POST /channelSections": {
    response: unknown;
    searchParams: { part: string };
    body: Record<string, unknown>;
    headers: Headers & { "Content-Type": string };
  };
  "DELETE /channelSections": {
    response: void;
    searchParams: { id: string };
    headers: Headers;
  };
  "POST /commentThreads": {
    response: unknown;
    searchParams: { part: string };
    body: Record<string, unknown>;
    headers: Headers & { "Content-Type": string };
  };
  "POST /comments/setModerationStatus": {
    response: void;
    searchParams: {
      id: string;
      moderationStatus: string;
      banAuthor: string;
    };
    headers: Headers & { "Content-Length": string };
  };
  "PUT /comments": {
    response: unknown;
    searchParams: { part: string };
    body: Record<string, unknown>;
    headers: Headers & { "Content-Type": string };
  };
  "GET /comments": {
    response: unknown;
    searchParams: {
      part: string;
      id: string;
    };
    headers: Headers;
  };
  "POST /comments/rate": {
    response: void;
    searchParams: {
      id: string;
      rating: "like" | "dislike" | "none";
    };
    headers: Headers & { "Content-Length": string };
  };
  "POST /comments": {
    response: unknown;
    searchParams: { part: string };
    body: Record<string, unknown>;
    headers: Headers & { "Content-Type": string };
  };
  "POST /liveBroadcasts/bind": {
    response: LiveBroadcast;
    searchParams: {
      id: string;
      streamId: string;
      part: string;
    };
    headers: Headers & { "Content-Length": string };
  };
  "POST /liveBroadcasts": {
    response: LiveBroadcast;
    searchParams: { part: string };
    body: {
      snippet: Record<string, unknown>;
      status: Record<string, unknown>;
      contentDetails: Record<string, unknown>;
    };
    headers: Headers & { "Content-Type": string };
  };
  "POST /liveStreams": {
    response: LiveStream;
    searchParams: { part: string };
    body: {
      snippet: Record<string, unknown>;
      cdn: Record<string, unknown>;
      contentDetails: Record<string, unknown>;
    };
    headers: Headers & { "Content-Type": string };
  };
  "DELETE /liveBroadcasts": {
    response: void;
    searchParams: { id: string };
    headers: Headers;
  };
  "POST /liveBroadcasts/transition": {
    response: LiveBroadcast;
    searchParams: {
      id: string;
      broadcastStatus: "testing" | "live" | "complete";
      part: string;
    };
    headers: Headers & { "Content-Length": string };
  };
  "PUT /liveBroadcasts": {
    response: LiveBroadcast;
    searchParams: { part: string };
    body: {
      id: string;
      snippet?: Record<string, unknown>;
      status?: Record<string, unknown>;
      contentDetails?: Record<string, unknown>;
    };
    headers: Headers & { "Content-Type": string };
  };
  "POST /upload/youtube/v3/liveBroadcasts/thumbnails": {
    response: { items: Array<Record<string, unknown>> };
    searchParams: {
      uploadType: string;
      broadcastId: string;
    };
    body: Uint8Array;
    headers: Headers & {
      "Content-Type": string;
      "Content-Length": string;
    };
  };
}

export interface AuthClient {
  "POST /token": {
    response: youtubeTokenResponse;
    searchParams: {
      code?: string;
      client_id: string;
      client_secret: string;
      redirect_uri?: string;
      grant_type: string;
      refresh_token?: string;
    };
  };
}
