import { ClientOf } from "../../utils/http.ts";

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  tokenObtainedAt?: number;
}

export interface OAuthProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId: string;
  clientSecret: string;
  grant_type?: string;
  tokenParamsLocation?: "body" | "query";
}

export interface OAuthTokenEndpoint {
  response: OAuthTokens;
  searchParams: {
    grant_type: string;
    code?: string;
    refresh_token?: string;
    client_id: string;
    client_secret: string;
    redirect_uri?: string;
  };
}

export type OAuthTokenEndpoints<T> = keyof {
  [K in keyof T as T[K] extends OAuthTokenEndpoint ? K : never]: T[K];
};

export type OAuthClients<TApiClient, TAuthClient> =
  & ClientOf<TApiClient & TAuthClient>
  & {
    oauth: {
      tokens: OAuthTokens;
      provider: OAuthProvider;
      refreshTokens: () => Promise<void>;
    };
  };

export interface OverrideAuthHeaderProps {
  /**
   * @hide true
   * The access token to use for the request.
   * If not provided, the access token will be fetched from the session.
   * Just for internal use, should not be filled by tool calls.
   */
  accessToken?: string;
}
