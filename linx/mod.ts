import type { App, AppContext as AC } from "deco/mod.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client.ts";

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
 *  IMPORTANT: This app needs the DECO_PROXY_DOMAIN=linx.decocache.com
 *  environment variable to work properly.
 */

/**
 * @title Linx
 * @description Loaders, actions and workflows for adding Linx Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/linx/logo.png
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
  });

  const state = { cdn, api, account };

  const app: App<Manifest, typeof state> = { manifest, state };

  return app;
}
