import {
  createOAuthHttpClient,
  OAUTH_CLIENT_OVERRIDE_AUTH_HEADER_NAME,
  OAuthClientConfig,
} from "../httpClient.ts";
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

/**
 * Utility function to get current user information using OAuth
 */
export async function getCurrentUser(
  userInfoClient: GoogleUserInfoClient,
  accessToken?: string,
  apiName = "Google API",
): Promise<GoogleUserInfo> {
  try {
    const opts: RequestInit = {};

    if (accessToken) {
      opts.headers = new Headers({
        [OAUTH_CLIENT_OVERRIDE_AUTH_HEADER_NAME]: `Bearer ${accessToken}`,
      });
    }

    const response = await userInfoClient["GET /oauth2/v2/userinfo"](
      {},
      opts,
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`${apiName} error: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Erro interno: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
