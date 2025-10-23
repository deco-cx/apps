import { createHttpClient } from "../../utils/http.ts";
import { DecoRequestInit, fetchSafe } from "../../utils/fetch.ts";
import { isTokenExpiredByTime } from "./utils.ts";
import {
  OAuthClients,
  OAuthProvider,
  OAuthTokenEndpoints,
  OAuthTokens,
} from "./types.ts";
import {
  createTokenRefresher,
  CustomRefreshFunction,
  TokenRefresher,
} from "./refresh.ts";
import { createOAuthProxy } from "./proxy.ts";
import {
  DEFAULT_BUFFER_SECONDS,
  DEFAULT_OAUTH_HEADERS,
  DEFAULT_TOKEN_ENDPOINT,
  OAuthClientOptions,
} from "./config.ts";

export const OAUTH_CLIENT_OVERRIDE_AUTH_HEADER_NAME =
  "X-OAuth-Client-Override-Authorization";

/**
 * Configuration for creating a unified OAuth client
 * @template TApiClient - API client type
 * @template TAuthClient - Auth client type
 */
export interface OAuthClientConfig<TApiClient, TAuthClient> {
  provider: OAuthProvider;
  apiBaseUrl: string;
  tokens?: OAuthTokens;
  onTokenRefresh?: (newTokens: OAuthTokens) => Promise<void> | void;
  /** Função customizada para refresh token - substitui o endpoint padrão quando definida */
  customRefreshFunction?: CustomRefreshFunction;
  options?: OAuthClientOptions;
}

/**
 * Creates a fetcher that automatically refreshes expired tokens
 * @template TAuthClient - Auth client type
 * @param tokenRefresher - Token refresh manager
 * @param bufferSeconds - Buffer seconds before expiration
 */
export const createFetchWithAutoRefresh = <TAuthClient>(
  tokenRefresher: TokenRefresher<TAuthClient>,
  bufferSeconds: number = DEFAULT_BUFFER_SECONDS,
) => {
  return async (
    input: string | Request | URL,
    init?: DecoRequestInit,
  ): Promise<Response> => {
    const inlineHeaders = new Headers(init?.headers);
    const authHeaderOverride = inlineHeaders.get(
      OAUTH_CLIENT_OVERRIDE_AUTH_HEADER_NAME,
    );
    if (authHeaderOverride) {
      const headers = new Headers(init?.headers);
      headers.delete(OAUTH_CLIENT_OVERRIDE_AUTH_HEADER_NAME);
      headers.set("Authorization", authHeaderOverride);
      console.log("authHeaderOverride", authHeaderOverride, headers);
      return await fetchSafe(input, {
        ...init,
        headers,
      });
    }

    const tokens = await tokenRefresher.getTokens();

    if (isTokenExpiredByTime(tokens, bufferSeconds)) {
      await tokenRefresher.refreshTokens();
    }

    try {
      return await fetchSafe(input, init);
    } catch (error) {
      if (error instanceof Error && "status" in error && error.status === 401) {
        await tokenRefresher.refreshTokens();

        const newHeaders = new Headers(init?.headers);
        newHeaders.set(
          "Authorization",
          `Bearer ${await tokenRefresher.getAccessToken()}`,
        );
        return fetchSafe(input, { ...init, headers: newHeaders });
      }
      throw error;
    }
  };
};

/**
 * Creates a unified HTTP client with OAuth support
 * @template TApiClient - API client type
 * @template TAuthClient - Auth client type
 * @param config - OAuth client configuration
 * @returns Unified client with API + Auth + OAuth
 */
export const createOAuthHttpClient = <TApiClient, TAuthClient = TApiClient>(
  config: OAuthClientConfig<TApiClient, TAuthClient>,
): OAuthClients<TApiClient, TAuthClient> => {
  const tokens = config.tokens || {} as OAuthTokens;
  const options = config.options || {};
  const headers = options.headers || DEFAULT_OAUTH_HEADERS;
  const tokenEndpoint =
    (options.tokenEndpoint || DEFAULT_TOKEN_ENDPOINT) as OAuthTokenEndpoints<
      TAuthClient
    >;

  const authClient = createHttpClient<TAuthClient>({
    base: config.provider.tokenUrl,
    headers: new Headers({
      "Accept": headers.auth.accept,
      "Content-Type": headers.auth.contentType,
    }),
    ...options.authClientConfig,
  });

  const tokenRefresher = createTokenRefresher({
    tokens,
    authClient,
    provider: config.provider,
    tokenEndpoint,
    onTokenRefresh: config.onTokenRefresh,
    customRefreshFunction: config.customRefreshFunction,
  });

  const fetchWithAutoRefresh = createFetchWithAutoRefresh(
    tokenRefresher,
    options.bufferSeconds,
  );

  const accessToken = tokenRefresher.getAccessToken();
  const apiClient = createHttpClient<TApiClient>({
    base: config.apiBaseUrl,
    headers: new Headers({
      "Accept": headers.api.accept,
      "Content-Type": headers.api.contentType,
      ...(accessToken
        ? {
          "Authorization": `Bearer ${accessToken}`,
        }
        : {}),
    }),
    fetcher: fetchWithAutoRefresh,
    ...options.apiClientConfig,
  });

  return createOAuthProxy({
    apiClient,
    authClient,
    tokenEndpoint,
    tokens,
    provider: config.provider,
    refreshTokens: () => tokenRefresher.refreshTokens(),
  }) as OAuthClients<TApiClient, TAuthClient>;
};
