import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  API_URL,
  ERROR_FAILED_TO_CREATE_FILE,
  ERROR_FAILED_TO_DELETE_FILE,
  ERROR_FAILED_TO_GET_FILE,
  ERROR_FAILED_TO_LIST_FILES,
  ERROR_FAILED_TO_UPDATE_FILE,
  ERROR_FILE_NOT_FOUND,
  ERROR_INVALID_PARAMETERS,
  ERROR_MISSING_FILE_ID,
  ERROR_MISSING_FILE_NAME,
  ERROR_MISSING_MIME_TYPE,
  OAUTH_URL,
  OAUTH_URL_AUTH,
  SCOPES,
} from "./utils/constant.ts";
import { AuthClient, Client } from "./utils/client.ts";
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
}

export interface State extends Props {
  client: OAuthClients<Client, AuthClient>;
  userInfoClient: GoogleUserInfoClient;
  errorHandler: ErrorHandler;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Google Drive
 * @description Integration with Google Drive using OAuth 2.0 with automatic token refresh
 * @category Productivity
 * @logo https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/1200px-Google_Drive_icon_%282020%29.svg.png
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

  const client = createOAuthHttpClient<Client, AuthClient>({
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
    errorMessages: {
      ERROR_FAILED_TO_LIST_FILES,
      ERROR_FAILED_TO_GET_FILE,
      ERROR_FAILED_TO_CREATE_FILE,
      ERROR_FAILED_TO_UPDATE_FILE,
      ERROR_FAILED_TO_DELETE_FILE,
      ERROR_FILE_NOT_FOUND,
      ERROR_INVALID_PARAMETERS,
      ERROR_MISSING_FILE_ID,
      ERROR_MISSING_FILE_NAME,
      ERROR_MISSING_MIME_TYPE,
    },
    defaultErrorMessage: "Google Drive operation failed",
  });

  const state: State = {
    ...props,
    tokens,
    client,
    userInfoClient,
    errorHandler,
  };

  return {
    state,
    manifest,
  };
}
