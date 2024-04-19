import type { App, AppContext as AC } from "deco/mod.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API, LayerAPI } from "./utils/client.ts";
import { Secret } from "../website/loaders/secret.ts";

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

  /**
   * @title Linx integration token
   * @description user:password of a Linx integration account encoded in base64
   */
  integrationToken: Secret;
}

export const color = 0xFF6A3B;

/**
 *  IMPORTANT: This app needs the DECO_PROXY_DOMAIN=linx.decocache.com
 *  environment variable to work properly.
 */

/**
 * @title LINX
 */
export default function App(
  { account, cdn, integrationToken }: State,
) {
  const headers = new Headers({
    "Accept": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    "Authorization": `Basic ${integrationToken.get()}`,
  });

  const api = createHttpClient<API>({
    base: `https://${account}.core.dcg.com.br/`,
    headers,
  });

  const layer = createHttpClient<LayerAPI>({
    base: `https://${account}.layer.core.dcg.com.br/`,
    headers,
  });

  const state = { cdn, api, account, layer };

  const app: App<Manifest, typeof state> = { manifest, state };

  return app;
}
