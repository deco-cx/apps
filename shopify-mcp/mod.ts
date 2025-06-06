import type { App, AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import shopify, { Props, State } from "../shopify/mod.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { fetchSafe } from "../utils/fetch.ts";
import getStateFromZip from "../commerce/utils/stateByZip.ts";
interface AppProps extends Props {
  stringAdminAccessToken: string;
}

export const color = 0x96BF48;
/**
 * @title Shopify MCP
 * @description Loaders, actions and workflows for adding Shopify Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/shopify/logo.png
 */
export default function App(
  props: AppProps,
): App<
  Manifest,
  State
> {
  const { storeName, storefrontAccessToken, stringAdminAccessToken } = props;

  const storefront = createGraphqlClient({
    fetcher: fetchSafe,
    endpoint: `https://${storeName}.myshopify.com/api/2025-07/graphql.json`,
    headers: new Headers({
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    }),
  });

  const admin = createGraphqlClient({
    fetcher: fetchSafe,
    endpoint:
      `https://${storeName}.myshopify.com/admin/api/2025-07/graphql.json`,
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
    dependencies: [shopify(props)],
  };
}

export type SiteApp = ReturnType<typeof App>;
export type AppContext = AC<SiteApp>;
