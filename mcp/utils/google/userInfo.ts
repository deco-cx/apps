import { createOAuthHttpClient, OAuthClientConfig } from "../httpClient.ts";
import { OAuthClients } from "../types.ts";
import { GoogleAuthClient } from "./authClient.ts";

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

export interface GoogleUserInfoAPI {
  "GET /oauth2/v2/userinfo": {
    response: GoogleUserInfo;
  };
}

export type GoogleUserInfoClient = OAuthClients<
  GoogleUserInfoAPI,
  GoogleAuthClient
>;

export const GOOGLE_USER_INFO_API_URL = "https://www.googleapis.com";
export const GOOGLE_USER_INFO_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function createGoogleOAuthUserInfoClient(
  config: Omit<
    OAuthClientConfig<GoogleUserInfoAPI, GoogleAuthClient>,
    "apiBaseUrl"
  >,
) {
  return createOAuthHttpClient<GoogleUserInfoAPI, GoogleAuthClient>({
    apiBaseUrl: GOOGLE_USER_INFO_API_URL,
    ...config,
  });
}
