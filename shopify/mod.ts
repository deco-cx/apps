import type { App, FnContext } from "$live/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createClient } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

/** @title Shopify */
export interface Props {
  /**
   * @description Shopify store name.
   */
  storeName: string;

  /**
   * @description Store public URL.
   */
  publicUrl: string;

  /**
   * @ttile Access Token
   * @description Shopify storefront access token.
   */
  storefrontAccessToken: string;

  /**
   * @description Use Shopify as backend platform
   */
  platform: "shopify";
}

export interface State extends Props {
  client: ReturnType<typeof createClient>;
}

/**
 * @title Shopify
 */
export default function App(props: Props): App<Manifest, State> {
  return {
    state: {
      ...props,
      client: createClient(props),
    },
    manifest,
  };
}
