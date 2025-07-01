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
 * @description Send rich messages to Discord channels using webhooks. Customize messages with embeds, mentions, and formatting.
 * @category Communication
 * @logo https://cdn-1.webcatalog.io/catalog/discohook/discohook-icon.png?v=1714780453968
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
