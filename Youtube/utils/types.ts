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

export interface YoutubeChannelResponse {
  kind: string;
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      publishedAt?: string;
      country?: string;
      thumbnails: {
        default: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
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
        default: { url: string; width: number; height: number };
        medium?: { url: string; width: number; height: number };
        high?: { url: string; width: number; height: number };
        standard?: { url: string; width: number; height: number };
        maxres?: { url: string; width: number; height: number };
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
    statistics?: {
      viewCount: string;
      likeCount: string;
      favoriteCount: string;
      commentCount: string;
    };
  }>;
}
