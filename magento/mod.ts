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

  /** @title Magento store */
  site: string;

  /** @title Magento store id */
  storeId: number;
}

type PartialProps = Omit<Props, "baseUrl">;

export interface State extends PartialProps {
  clientGuest: ReturnType<typeof createHttpClient<API>>;
  clientAdmin: ReturnType<typeof createHttpClient<API>>;
}

/**
 * @title Magento
 * @description Loaders, actions and workflows for adding Magento Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://avatars.githubusercontent.com/u/168457?s=200&v=4
 */
export default function App(props: Props): App<Manifest, State> {
  const { baseUrl, site, storeId, apiKey } = props;

  const clientGuest = createHttpClient<API>({
    base: baseUrl,
  });
  const clientAdmin = createHttpClient<API>({
    base: baseUrl,
    headers: new Headers(
      {
        "Authorization": `Bearer ${apiKey}`,
      },
    ),
  });

  return {
    manifest,
    state: { site, storeId, apiKey, clientGuest, clientAdmin },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
