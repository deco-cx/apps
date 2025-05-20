import type { FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { GoogleAuthClient, GoogleSlidesClient } from "./utils/client.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { McpContext } from "./mcp/context.ts";

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
  client: ReturnType<typeof createHttpClient<GoogleSlidesClient>>;
  authClient: ReturnType<typeof createHttpClient<GoogleAuthClient>>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;
/**
 * @title Google Slides
 * @description Create and manage Google Slides presentations
 * @category Content Management
 * @logo https://www.gstatic.com/images/branding/product/1x/slides_48dp.png
 */
export default function App({ ...props }: Props) {
  const client = createHttpClient<GoogleSlidesClient>({
    base: "https://slides.googleapis.com",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${props.access_token}`,
    }),
    fetcher: fetchSafe,
  });

  const authClient = createHttpClient<GoogleAuthClient>({
    base: "https://oauth2.googleapis.com",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${props.access_token}`,
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
