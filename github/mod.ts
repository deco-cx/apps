import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { McpContext } from "../mcp/context.ts";
import { Client } from "./utils/client.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { GITHUB_URL } from "./utils/constant.ts";
import { createHttpClient } from "../utils/http.ts";

export interface Props {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  refresh_token_expires_in?: number;
  tokenObtainedAt?: number;
}

export interface State extends Props {
  client: ReturnType<typeof createHttpClient<Client>>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @name GitHub
 * @title GitHub
 * @description A Deco app to interact with the GitHub APIs with strongly typed responses.
 * @logo https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { access_token } = props;

  const updatedProps = {
    ...props,
    tokenObtainedAt: access_token
      ? (props.tokenObtainedAt || Math.floor(Date.now() / 1000))
      : undefined,
  };

  const client = createHttpClient<Client>({
    base: GITHUB_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = { ...updatedProps, client };
  return {
    state,
    manifest,
  };
}
