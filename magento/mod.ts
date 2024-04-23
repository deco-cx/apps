import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { Secret } from "../website/loaders/secret.ts";
import { API } from "./utils/client/client.ts";
import { createHttpClient } from "../utils/http.ts";

export interface Props {
  /** @title Magento api url */
  baseUrl: string;

  /** @title Magento api key */
  apiKey: Secret;

  /** @title Magento store */
  store?: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<API>>;
}

/**
 * @title Magento
 * @description Loaders, actions and workflows for adding Magento Commerce Platform to your website.
 * @category Ecommmerce
 */
export default function App(props: Props): App<Manifest, State> {
  const { baseUrl } = props;
  const clientGuest = createHttpClient<API>({
    base: baseUrl,
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  });
  return { manifest, state: { ...props, api: clientGuest } };
}

export type AppContext = AC<ReturnType<typeof App>>;
