import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { McpContext } from "../mcp/context.ts";
import { Client } from "./utils/client.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { GITHUB_URL } from "./utils/constant.ts";
import { createHttpClient } from "../utils/http.ts";

export interface Props {
  access_token?: string;
  scope?: string;
  token_type?: string;
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

  const client = createHttpClient<Client>({
    base: GITHUB_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(access_token
        ? {
          "Authorization": `Bearer ${access_token}`,
        }
        : {}),
    }),
    fetcher: fetchSafe,
  });

  const state = { ...props, client };
  return {
    state,
    manifest,
  };
}
