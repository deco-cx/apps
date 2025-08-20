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
 * @appName github
 * @title GitHub
 * @description Create and manage issues, repositories, and pull requests.
 * @logo https://assets.decocache.com/mcp/02e06fe6-a820-4c42-b960-bce022362702/GitHub.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { access_token } = props;

  const client = createHttpClient<Client>({
    base: GITHUB_URL,
    headers: new Headers({
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
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
