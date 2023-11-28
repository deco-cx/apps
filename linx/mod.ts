import type { App, AppContext as AC } from "deco/mod.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client.ts";
import { DecoRequestInit, fetchSafe } from "../utils/fetch.ts";

export type AppContext = AC<ReturnType<typeof App>>;

/** @title LINX */
export interface State {
  /**
   * @title LINX Account name
   * @default deco
   */
  account: string;

  /**
   * @title Image CDN URL
   * @description e.g.: https://{account}.cloudfront.net/
   */
  cdn: string;
}

export const color = 0xFF6A3B;

/**
 * @title LINX
 */
export default function App(
  { account, cdn }: State,
) {
  const api = createHttpClient<API>({
    base: `https://${account}.core.dcg.com.br/`,
    headers: new Headers({
      "Accept": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    }),
    // Our caching layer changes the user agent that linx requires. This makes the pages break.
    // This fetcher removes the caching layer.
    // TODO: Go back to caching requests. This can be done once we have different cache provider (Deno/CF etc)
    fetcher: (input: string | Request | URL, init?: DecoRequestInit) =>
      fetchSafe(
        input,
        // @ts-ignore no cache for now
        { ...init, deco: { cache: "no-store" } },
      ),
  });

  const state = { cdn, api, account };

  const app: App<Manifest, typeof state> = { manifest, state };

  return app;
}
