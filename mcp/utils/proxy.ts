import { ClientOf } from "../../utils/http.ts";
import { OAuthProvider, OAuthTokens } from "./types.ts";

export interface OAuthProxyConfig<TApiClient, TAuthClient> {
  apiClient: ClientOf<TApiClient>;
  authClient: ClientOf<TAuthClient>;
  tokenEndpoint: keyof TAuthClient;
  tokens: OAuthTokens;
  provider: OAuthProvider;
  refreshTokens: () => Promise<void>;
}

export function createOAuthProxy<TApiClient, TAuthClient>(
  config: OAuthProxyConfig<TApiClient, TAuthClient>,
): ClientOf<TApiClient & TAuthClient> {
  return new Proxy({} as ClientOf<TApiClient & TAuthClient>, {
    get: (_target, prop: string | symbol) => {
      const propStr = String(prop);

      if (propStr === "oauth") {
        return {
          tokens: config.tokens,
          provider: config.provider,
          refreshTokens: config.refreshTokens,
        };
      }

      if (propStr === String(config.tokenEndpoint)) {
        // deno-lint-ignore no-explicit-any
        return (config.authClient as any)[config.tokenEndpoint];
      } else {
        // deno-lint-ignore no-explicit-any
        return (config.apiClient as any)[propStr];
      }
    },
  });
}
