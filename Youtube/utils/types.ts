// notice that here we have the types for the return of the API calls
// you can use https://quicktype.io/ to convert JSON to typescript

export interface Query {
  part: string;
  mine: boolean;
}

export interface YoutubeChannelResponse {
  kind: string;
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
      };
    };
  }>;
}

export interface YoutubeVideoResponse {
  kind: string;
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
      };
    };
  }>;
}
