// notice that here we have the types for the return of the API calls
// you can use https://quicktype.io/ to convert JSON to typescript

export interface Query {
  part: string;
  mine: boolean;
}

export interface VideoQuery {
  part: string;
  channelId?: string;
  maxResults?: number;
  order?: string;
}

export type PrivacyStatus = "public" | "private" | "unlisted";

type Kind =
  | "youtube#video"
  | "youtube#playlist"
  | "youtube#channel"
  | "youtube#comment"
  | "youtube#commentThread"
  | "youtube#live";

interface Base {
  kind: Kind;
  etag: string;
  id: string;
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    standard?: Thumbnail;
  };
  channelTitle: string;
  categoryId: string;
  liveBroadcastContent: string;
  localized: {
    title: string;
    description: string;
  };
  defaultAudioLanguage?: string;
}

interface Status {
  categoryId: string;
  liveBroadcastContent: string;
  localized: {
    title: string;
    description: string;
  };
}

interface Statistics {
  viewCount: string;
  likeCount: string;
  dislikeCount?: string;
  favoriteCount: string;
  commentCount: string;
}

interface Status {
  uploadStatus: string;
  privacyStatus: string;
  license: string;
  embeddable: boolean;
  publicStatsViewable: boolean;
}

interface Video extends Base {
  kind: "youtube#video";
  etag: string;
  id: string;
  snippet: Snippet;
  status: Status;
  statistics: Statistics;
}

export interface YoutubeChannelResponse {
  kind: string;
  items: Array<{
    id: string;
    snippet: Snippet;
  }>;
}

export interface YoutubeVideoResponse {
  kind: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
  items: Array<{
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      channelTitle?: string;
      thumbnails: {
        default: Thumbnail;
        medium?: Thumbnail;
        high?: Thumbnail;
        standard?: Thumbnail;
        maxres?: Thumbnail;
      };
      tags?: string[];
      categoryId?: string;
      liveBroadcastContent?: string;
      defaultLanguage?: string;
      localized?: {
        title: string;
        description: string;
      };
    };
    statistics?: Statistics;
  }>;
}

export interface UpdateThumbnailResponse {
  kind: string;
  etag: string;
  videoId: string;
  items: Array<{
    default: Thumbnail;
    medium?: Thumbnail;
    high?: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
  }>;
}
