import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { McpContext } from "../mcp/context.ts";
import { Client } from "./utils/client.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { DISCORD_API_URL } from "./utils/constant.ts";
import { createHttpClient } from "../utils/http.ts";

export interface Props {
  /**
   * @title Bot Token
   * @description Discord Bot Token from Developer Portal
   */
  botToken: string;
}

export interface State extends Props {
  client: ReturnType<typeof createHttpClient<Client>>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Discord Bot
 * @appName discordbot
 * @description Discord Bot integration for sending messages, managing channels, and server moderation
 * @category Communication
 * @logo https://support.discord.com/hc/user_images/PRywUXcqg0v5DD6s7C3LyQ.jpeg
 */
export default function App(props: Props): App<Manifest, State> {
  const { botToken } = props;

  const client = createHttpClient<Client>({
    base: DISCORD_API_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(botToken
        ? {
          "Authorization": `Bot ${botToken}`,
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
