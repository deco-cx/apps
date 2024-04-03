import type { App, FnContext } from "deco/mod.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import getStateFromZip from "../commerce/utils/stateByZip.ts";
import type { Secret } from "../website/loaders/secret.ts";

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
  adminAccessToken: Secret;

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

export const color = 0x96BF48;

/**
 * @title Shopify
 * @description Loaders, actions and workflows for adding Shopify Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/shopify/logo.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { storeName, storefrontAccessToken, adminAccessToken } = props;

  const stringAdminAccessToken = typeof adminAccessToken === "string"
    ? adminAccessToken
    : adminAccessToken?.get?.() ?? "";

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
      "X-Shopify-Access-Token": stringAdminAccessToken,
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
