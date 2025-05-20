import type { AuthClient, Client } from "./utils/client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { McpContext } from "../mcp/context.ts";

export interface Props {
  code?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  refresh_token_expires_in?: number;
}

export interface State extends Props {
  client: ReturnType<typeof createHttpClient<Client>>;
  authClient: ReturnType<typeof createHttpClient<AuthClient>>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Youtube
 * @description Loaders, actions and authentication for the Youtube API for Deco.
 * @category Social
 * @logo https://cdn.pixabay.com/photo/2021/09/11/18/21/youtube-6616310_1280.png
 */
export default function App({ ...props }: Props) {
  const client = createHttpClient<Client>({
    base: "https://www.googleapis.com/youtube/v3",
    headers: new Headers({
      "Accept": "application/json",
      "Authorization": `Bearer ${props.access_token}`,
    }),
    fetcher: fetchSafe,
  });

  const authClient = createHttpClient<AuthClient>({
    base: "https://oauth2.googleapis.com",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    }),
    fetcher: fetchSafe,
  });

  const state = {
    ...props,
    client,
    authClient,
  };

  return {
    state,
    manifest,
  };
}
