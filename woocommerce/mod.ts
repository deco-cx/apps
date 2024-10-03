import type { App as A, AppContext as AC, AppRuntime as AR } from "@deco/deco";
import workflow from "../workflows/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { WooCommerceAPI } from "./utils/client.ts";
import type { Secret } from "../website/loaders/secret.ts";

import { Markdown } from "../decohub/components/Markdown.tsx";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { PreviewWooCommerce } from "./preview/Preview.tsx";
import { getAuthValue } from "./utils/getAuthValue.ts";

export type App = ReturnType<typeof WooCommerce>;
export type AppContext = AC<App>;

/** @title WooCommerce */
export interface Props {
  /**
   * @title Public store URL
   * @description Domain that is registered on License Manager (e.g: www.mystore.com.br)
   */
  publicUrl: string;
  /**
   * @title Customer Key
   */
  customer_key?: Secret;
  /**
   * @title Customer Secret
   */
  customer_secret?: Secret;
  /**
   * @description Use WooCommerce as backend platform
   */
  platform: "WooCommerce";
}

export const color = 0x800080;

/**
 * @title WooCommerce
 * @description Loaders, actions and workflows for adding WooCommerce Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/woocommerce/logo.png
 */
export default function WooCommerce(
  { customer_key, customer_secret, publicUrl }: Props,
) {
  const ck = getAuthValue(customer_key);
  const cs = getAuthValue(customer_secret);

  const createBasicAuth = (key: string, secret: string) =>
    btoa(`${encodeURIComponent(key)}:${encodeURIComponent(secret)}`);

  const auth = createBasicAuth(ck, cs);

  const headers = new Headers();
  headers.set("accept", "application/json");
  headers.set("Authorization", `Basic ${auth}`);
  headers.set("content-type", "application/json");

  const api = createHttpClient<WooCommerceAPI>({
    base: `${publicUrl}/wp-json/`,
    fetcher: fetchSafe,
    headers,
  });

  const state = {
    api,
    publicUrl,
  };

  const app: A<Manifest, typeof state, [ReturnType<typeof workflow>]> = {
    state,
    manifest,
    dependencies: [workflow({})],
  };

  return app;
}

export const preview = async (props: AR) => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewWooCommerce,
    props: {
      ...props,
      markdownContent,
    },
  };
};
