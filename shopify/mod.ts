import type { App, FnContext } from "deco/mod.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import getStateFromZip from "../commerce/utils/stateByZip.ts";

export type AppContext = FnContext<State, Manifest>;

/** @title Shopify */
export interface Props {
  /**
   * @description Shopify store name.
   */
  storeName: string;

  /**
   * @title Access Token
   * @description Shopify storefront access token.
   */
  storefrontAccessToken: string;

  /**
   * @ttile Access Token
   * @description Shopify admin access token.
   */
  adminAccessToken: string;

  /** @description Disable password protection on the store */
  storefrontDigestCookie?: string;

  /**
   * @description Use Shopify as backend platform
   */
  platform: "shopify";
}

export interface Address {
  provinceCode: string;
}

export interface AddressLocator {
  byZipCode(zip: string): Promise<Address | null>;
}

export interface State extends Props {
  storefront: ReturnType<typeof createGraphqlClient>;
  admin: ReturnType<typeof createGraphqlClient>;
  address: AddressLocator;
}

/**
 * @title Shopify
 */
export default function App(props: Props): App<Manifest, State> {
  const { storeName, storefrontAccessToken, adminAccessToken } = props;
  const storefront = createGraphqlClient({
    fetcher: fetchSafe,
    endpoint: `https://${storeName}.myshopify.com/api/2023-07/graphql.json`,
    headers: new Headers({
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    }),
  });
  const admin = createGraphqlClient({
    fetcher: fetchSafe,
    endpoint:
      `https://${storeName}.myshopify.com/admin/api/2023-07/graphql.json`,
    headers: new Headers({
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminAccessToken || "",
    }),
  });

  const byZipCode = (zip: string) => {
    return Promise.resolve({
      provinceCode: getStateFromZip(zip),
    });
  };

  return {
    state: { ...props, admin, storefront, address: { byZipCode } },
    manifest,
  };
}
