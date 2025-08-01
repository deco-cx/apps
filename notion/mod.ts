import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "apps/utils/fetch.ts";
import { createHttpClient } from "apps/utils/http.ts";
import { PreviewContainer } from "apps/utils/preview.tsx";
import type { Secret } from "apps/website/loaders/secret.ts";
import { McpContext } from "../mcp/context.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { NotionClient } from "./utils/client.ts";

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

export interface Props {
  /**
   * @title Notion Integration Token
   * @description Your Notion integration token (starts with ntn_ or secret_)
   */
  token: string | Secret;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<NotionClient>>;
}

/**
 * @title Notion MCP
 * @appName notion
 * @description Access and manage your Notion workspace - pages, databases, blocks, and more.
 * @category Productivity
 * @logo https://assets.decocache.com/mcp/notion-logo.svg
 */
export default function App(
  props: Props,
  _req: Request,
  _ctx?: McpContext<Props>,
): App<Manifest, State> {
  const { token } = props;

  // Handle different token types (string or Secret)
  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<NotionClient>({
    base: "https://api.notion.com/v1",
    headers: new Headers({
      "Authorization": `Bearer ${stringToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    }),
    fetcher: fetchSafe,
  });

  const state = { ...props, api };

  return {
    state,
    manifest,
  };
}

export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Notion MCP",
      owner: "deco.cx",
      description:
        "Access and manage your Notion workspace - pages, databases, blocks, and more.",
      logo: "https://assets.decocache.com/mcp/notion-logo.svg",
      images: [],
      tabs: [],
    },
  };
};
