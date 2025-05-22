import type { GoogleAuthClient, GoogleSheetsClient } from "./utils/client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { McpContext } from "../mcp/context.ts";
import { GOOGLE_OAUTH_URL, GOOGLE_SHEETS_URL } from "./utils/constant.ts";

export interface Props {
  code?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  refresh_token_expires_in?: number;
  tokenObtainedAt?: number;
  clientSecret?: string;
  clientId?: string;
}

export interface State extends Props {
  client: ReturnType<typeof createHttpClient<GoogleSheetsClient>>;
  authClient: ReturnType<typeof createHttpClient<GoogleAuthClient>>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Google Sheets
 * @description Integração com a API Google Sheets para criar, ler e modificar planilhas
 * @category Produtividade
 * @logo https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Google_Sheets_logo_%282014-2020%29.svg/1498px-Google_Sheets_logo_%282014-2020%29.svg.png
 */
export default function App({ ...props }: Props) {
  const client = createHttpClient<GoogleSheetsClient>({
    base: GOOGLE_SHEETS_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${props.access_token}`,
    }),
    fetcher: fetchSafe,
  });

  const authClient = createHttpClient<GoogleAuthClient>({
    base: GOOGLE_OAUTH_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    }),
    fetcher: fetchSafe,
  });

  const state: State = {
    ...props,
    client,
    authClient,
  };

  return {
    state,
    manifest,
  };
}
