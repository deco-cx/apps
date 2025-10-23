import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  API_URL,
  CLOUD_SEARCH_API_URL,
  ERROR_MESSAGES,
  OAUTH_URL,
  OAUTH_URL_AUTH,
  SCOPES,
} from "./utils/constant.ts";
import { AuthClient, GoogleSearchClient } from "./utils/client.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
  OAuthClients,
  OAuthProvider,
  OAuthTokens,
} from "../mcp/oauth.ts";
import {
  createErrorHandler,
  ErrorHandler,
} from "../mcp/utils/errorHandling.ts";
import {
  createGoogleOAuthUserInfoClient,
  GoogleUserInfoClient,
} from "../mcp/utils/google/userInfo.ts";

export const GoogleProvider: OAuthProvider = {
  name: "Google",
  authUrl: OAUTH_URL_AUTH,
  tokenUrl: OAUTH_URL,
  scopes: SCOPES,
  clientId: "",
  clientSecret: "",
};

export interface Props {
  tokens?: OAuthTokens;
  clientSecret?: string;
  clientId?: string;
  /**
   * @title Search Application ID (opcional)
   * @description ID do aplicativo de pesquisa do Google Cloud Search da sua organização. Caso não seja informado, será exibida uma mensagem explicando como obtê-lo com o TI.
   */
  searchApplicationId?: string;
}

export interface State extends Props {
  client: OAuthClients<GoogleSearchClient, AuthClient>;
  cloudSearchClient: OAuthClients<GoogleSearchClient, AuthClient>;
  userInfoClient: GoogleUserInfoClient;
  errorHandler: ErrorHandler;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Google Sites
 * @appName google-sites
 * @description Permite buscar conteúdo e extrair links de sites criados no Google Sites para uso em agentes e automações.
 * @category Ferramentas
 * @logo https://fonts.gstatic.com/s/i/productlogos/sites/v6/24px.svg
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const { tokens, clientId, clientSecret } = props;

  const googleProvider: OAuthProvider = {
    ...GoogleProvider,
    clientId: clientId ?? "",
    clientSecret: clientSecret ?? "",
  };

  const options: OAuthClientOptions = {
    headers: DEFAULT_OAUTH_HEADERS,
    authClientConfig: {
      headers: new Headers({
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      }),
    },
  };

  const client = createOAuthHttpClient<GoogleSearchClient, AuthClient>({
    provider: googleProvider,
    apiBaseUrl: API_URL,
    tokens,
    options,
    onTokenRefresh: async (newTokens: OAuthTokens) => {
      if (ctx) {
        await ctx.configure({
          ...ctx,
          tokens: newTokens,
        });
      }
    },
  });

  const cloudSearchClient = createOAuthHttpClient<
    GoogleSearchClient,
    AuthClient
  >({
    provider: googleProvider,
    apiBaseUrl: CLOUD_SEARCH_API_URL,
    tokens,
    options,
    onTokenRefresh: async (newTokens: OAuthTokens) => {
      if (ctx) {
        await ctx.configure({
          ...ctx,
          tokens: newTokens,
        });
      }
    },
  });

  const userInfoClient = createGoogleOAuthUserInfoClient({
    provider: googleProvider,
    tokens,
    options,
    onTokenRefresh: async (newTokens: OAuthTokens) => {
      if (ctx) {
        await ctx.configure({
          ...ctx,
          tokens: newTokens,
        });
      }
    },
  });

  const errorHandler = createErrorHandler({
    errorMessages: ERROR_MESSAGES,
    defaultErrorMessage: "Google Sites operation failed",
  });

  const state: State = {
    ...props,
    tokens,
    client,
    cloudSearchClient,
    userInfoClient,
    errorHandler,
  };

  return {
    state,
    manifest,
  };
}
