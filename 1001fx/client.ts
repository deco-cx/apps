import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";

export interface ImageConfig {
  imageUrl: string;
  duration: number;
}

export interface VideoResolution {
  width: number;
  height: number;
}

export interface Audio2VideoRequest {
  url: string;
  images?: ImageConfig[];
  thumbnailImageUrl?: string;
  videoResolution?: VideoResolution;
}

export interface Audio2VideoResponse {
  url: string;
  statusCode: number;
}

export interface FX1001Client {
  "POST /audiovideo/audio2video": {
    body: Audio2VideoRequest;
    response: Audio2VideoResponse;
  };
}

export const createFX1001Client = (
  apiKey: string,
  base = "https://api.1001fx.com",
) => {
  return createHttpClient<FX1001Client>({
    base,
    headers: new Headers({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    }),
    fetcher: fetchSafe,
  });
};
