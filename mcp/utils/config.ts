import { HttpClientOptions } from "../../utils/http.ts";

export interface OAuthHeaders {
  auth: {
    accept: string;
    contentType: string;
  };
  api: {
    accept: string;
    contentType: string;
  };
}

export const DEFAULT_OAUTH_HEADERS: OAuthHeaders = {
  auth: {
    accept: "application/json",
    contentType: "application/x-www-form-urlencoded",
  },
  api: {
    accept: "application/json",
    contentType: "application/json",
  },
};

export const DEFAULT_TOKEN_ENDPOINT = "POST /token";
export const DEFAULT_BUFFER_SECONDS = 60;

export interface OAuthClientOptions {
  headers?: OAuthHeaders;
  bufferSeconds?: number;
  tokenEndpoint?: string;
  apiClientConfig?: Partial<HttpClientOptions>;
  authClientConfig?: Partial<HttpClientOptions>;
}
