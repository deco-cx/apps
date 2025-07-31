import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { DiscordWebhookClient } from "./utils/client.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";

export type AppContext = FnContext<State, Manifest>;

export interface State {
  api: ReturnType<typeof createHttpClient<DiscordWebhookClient>>;
}

/**
 * @title Discord Webhook
 * @appName discohook
 * @description Send rich, formatted messages to Discord channels.
 * @category Communication
 * @logo https://assets.decocache.com/mcp/a626d828-e641-4931-8557-850276e91702/DiscordWebhook.svg
 */
export default function App(): App<Manifest, State> {
  const api = createHttpClient<DiscordWebhookClient>({
    base: "https://discord.com/api/v10/webhooks",
    headers: new Headers({
      "accept": "application/json",
      "accept-language": "en",
      "content-type": "application/json",
      "cache-control": "no-cache",
      "pragma": "no-cache",
    }),
    fetcher: fetchSafe,
  });

  const state = { api };

  return {
    state,
    manifest,
  };
}
