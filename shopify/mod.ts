import type { App, FnContext } from "$live/mod.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<State, Manifest>;

/** @title Shopify */
export interface Props {
  /**
   * @description Shopify store name.
   */
  storeName: string;

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
  storefront: ReturnType<typeof createGraphqlClient>;
}

/**
 * @title Shopify
 */
export default function App(props: Props): App<Manifest, State> {
  const { storeName, storefrontAccessToken } = props;
  const storefront = createGraphqlClient({
    endpoint: `https://${storeName}.myshopify.com/api/2023-07/graphql.json`,
    fetcher: fetchSafe,
    headers: new Headers({
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    }),
  });

  return { state: { ...props, storefront }, manifest };
}
