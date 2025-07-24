import { ClientOf, HttpError } from "../../utils/http.ts";
import { OAuthProvider, OAuthTokens } from "./types.ts";
import { isRefreshTokenExpired } from "./utils.ts";

export type CustomRefreshFunction = (params: {
  refresh_token: string;
  client_id: string;
  client_secret: string;
}) => Promise<OAuthTokens>;

export interface TokenRefresherConfig<TAuthClient> {
  tokens: OAuthTokens;
  authClient: ClientOf<TAuthClient>;
  provider: OAuthProvider;
  tokenEndpoint: keyof TAuthClient;
  onTokenRefresh?: (newTokens: OAuthTokens) => Promise<void> | void;
  customRefreshFunction?: CustomRefreshFunction;
}

export interface TokenRefresher<TAuthClient> {
  refreshTokens: () => Promise<void>;
  getAccessToken: () => string;
  getTokens: () => OAuthTokens;
}

export function createTokenRefresher<TAuthClient>(
  config: TokenRefresherConfig<TAuthClient>,
): TokenRefresher<TAuthClient> {
  const { tokens } = config;

  const fetchNewTokens = async (): Promise<OAuthTokens> => {
    const refreshToken = tokens.refresh_token!;

    if (config.customRefreshFunction) {
      return await config.customRefreshFunction({
        refresh_token: refreshToken,
        client_id: config.provider.clientId,
        client_secret: config.provider.clientSecret,
      });
    } else {
      const response =
        await (config.authClient[config.tokenEndpoint] as unknown as (
          query: unknown,
          args: {
            grant_type: string;
            refresh_token: string;
            client_id: string;
            client_secret: string;
          },
        ) => Promise<Response>)({}, {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: config.provider.clientId,
          client_secret: config.provider.clientSecret,
        });

      return (await response.json()) as OAuthTokens;
    }
  };

  const updateTokens = (newTokens: OAuthTokens): void => {
    tokens.access_token = newTokens.access_token;
    if (newTokens.refresh_token) {
      tokens.refresh_token = newTokens.refresh_token;
    }
    tokens.expires_in = newTokens.expires_in;
    tokens.tokenObtainedAt = Math.floor(Date.now() / 1000);
  };

  const refreshTokens = async (): Promise<void> => {
    if (!tokens.refresh_token) {
      throw new Error(
        `Refresh token not available for ${config.provider.name}`,
      );
    }

    try {
      const newTokens = await fetchNewTokens();
      updateTokens(newTokens);

      if (config.onTokenRefresh) {
        await config.onTokenRefresh(tokens);
      }
    } catch (error) {
      if (error instanceof HttpError && isRefreshTokenExpired(error)) {
        throw new Error("Refresh token expired");
      }

      if (error instanceof HttpError) {
        throw new HttpError(error.status, error.message);
      }

      throw new Error(`Unknown error during token refresh: ${error}`);
    }
  };

  const getAccessToken = (): string => {
    return tokens.access_token;
  };

  const getTokens = (): OAuthTokens => {
    return tokens;
  };

  return {
    refreshTokens,
    getAccessToken,
    getTokens,
  };
}
