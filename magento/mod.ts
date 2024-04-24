import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { Secret } from "../website/loaders/secret.ts";
import { API } from "./utils/client/client.ts";
import { createHttpClient } from "../utils/http.ts";

export interface Props {
  /**
   * @title Magento api url
   * @description The base url of the Magento API, If you have stores, put the name of the store at the end.
   * @example https://magento.com/rest/store1 or https://magento.com/rest
   */
  baseUrl: string;

  /** @title Magento api key */
  apiKey: Secret;
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
