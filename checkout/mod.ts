import type { App as DecoApp, AppContext as AC } from "deco/mod.ts";
import manifest, { type Manifest } from "./manifest.gen.ts";

import { createGraphqlClient } from "../utils/graphql.ts";
import { fetchSafe } from "../utils/fetch.ts";
import type { Secret } from "../website/loaders/secret.ts";

interface Props {
  storefrontToken: Secret;
}

interface State extends Props {
  storefront: ReturnType<typeof createGraphqlClient>;
}

/**
 * @title Checkout
 * @description Generic checkout
 * @logo https://files.catbox.moe/9g6xiq.png
 */
export default function App(props: State): DecoApp<Manifest, State> {
  const { storefrontToken } = props;

  const storefront = createGraphqlClient({
    endpoint: "https://storefront-api.fbits.net/graphql",
    headers: new Headers({
      "TCS-Access-Token": storefrontToken?.get?.() ?? "",
    }),
    fetcher: fetchSafe,
  });

  return { manifest, state: { ...props, storefront } };
}

export type AppContext = AC<ReturnType<typeof App>>;
