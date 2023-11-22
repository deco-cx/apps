import type { App, FnContext } from "deco/mod.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { createHttpClient } from "../utils/http.ts";
import { SecretString } from "../website/loaders/secretString.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { OpenAPI } from "./utils/openapi/wake.openapi.gen.ts";
import { CheckoutApi } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

export let state: null | State = null;

/** @title Wake */
export interface Props {
  /**
   * @title Account Name
   * @description erploja2 etc
   */
  account: string;

  /**
   * @title Checkout Url
   * @description https://checkout.erploja2.com.br
   */
  checkoutUrl: string;

  /**
   * @title Wake Storefront Token
   * @description https://wakecommerce.readme.io/docs/storefront-api-criacao-e-autenticacao-do-token
   */
  storefrontToken: SecretString;

  /**
   * @title Wake API token
   * @description The token for accessing wake commerce
   * @default deco
   */
  token?: SecretString;

  /**
   * @description Use Wake as backend platform
   */
  platform: "wake";
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<OpenAPI>>;
  checkoutApi: ReturnType<typeof createHttpClient<CheckoutApi>>;
  storefront: ReturnType<typeof createGraphqlClient>;
}

export const color = 0xB600EE;

/**
 * @title Wake
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, storefrontToken, account, checkoutUrl } = props;

  if (!token || !storefrontToken) {
    throw new Error("Missing tokens");
  }

  const storefront = createGraphqlClient({
    endpoint: "https://storefront-api.fbits.net/graphql",
    headers: new Headers({ "TCS-Access-Token": storefrontToken }),
    fetcher: fetchSafe,
  });

  const api = createHttpClient<OpenAPI>({
    base: "https://api.fbits.net",
    headers: new Headers({ "Authorization": `Basic ${token}` }),
    fetcher: fetchSafe,
  });

  const checkoutApi = createHttpClient<CheckoutApi>({
    base: checkoutUrl ?? `https://${account}.checkout.fbits.store`,
    fetcher: fetchSafe,
  });

  state = { ...props, api, storefront, checkoutApi };

  return {
    state,
    manifest,
  };
}
