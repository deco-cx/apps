import { ClientOf, HttpError } from "../../utils/http.ts";
import { OAuthProvider, OAuthTokens } from "./types.ts";
import { isRefreshTokenExpired } from "./utils.ts";

export interface TokenRefresherConfig<TAuthClient> {
  tokens: OAuthTokens;
  authClient: ClientOf<TAuthClient>;
  provider: OAuthProvider;
  tokenEndpoint: keyof TAuthClient;
  onTokenRefresh?: (newTokens: OAuthTokens) => Promise<void> | void;
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
      const response =
        await (config.authClient[config.tokenEndpoint] as unknown as (
          args: unknown,
        ) => Promise<Response>)({
          grant_type: "refresh_token",
          refresh_token: tokens.refresh_token,
          client_id: config.provider.clientId,
          client_secret: config.provider.clientSecret,
        });

      const newTokens = (await response.json()) as OAuthTokens;
      updateTokens(newTokens);

      if (config.onTokenRefresh) {
        await config.onTokenRefresh(tokens);
      }
    } catch (error) {
      if (error instanceof HttpError && isRefreshTokenExpired(error)) {
        throw new Error("Refresh token expired");
      }
      throw error;
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
