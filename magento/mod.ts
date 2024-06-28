import type { App, AppMiddlewareContext as AMC, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client/client.ts";
import { createHttpClient } from "../utils/http.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { middleware } from "./middleware.ts";

export interface FiltersGraphQL {
  value: string;
  type: "EQUAL" | "MATCH" | "RANGE";
}

export interface Props {
  /**
   * @title Magento api url
   * @description The base url of the Magento API, If you have stores, put the name of the store at the end.
   * @example https://magento.com/rest/store1 or https://magento.com/rest
   */
  baseUrl: string;

  /** @title Magento api key */
  apiKey: string;

  /** @title Magento store */
  site: string;

  /** @title Magento store id */
  storeId: number;

  /**
   * @title Currency Code
   * @description The currency code to be used in the requests: USD, BRL, EUR.
   */
  currencyCode: string;

  /**
   * @title Images URL
   * @description The base url of the images.
   * @example https://www.store.com.br/media/catalog/product
   */
  imagesUrl: string;

  /**
   * @title Images per shelf (max)
   * @description Max images qtd per shelf
   * @default 3
   */
  imagesQtd: number;

  /**
   * @title Use Magento store prop as URL path suffix in PDP
   */
  useSuffix: boolean;

  /**
   * @title Custom Filters
   * @description Applicate own filters
   */
  customFilters: Array<FiltersGraphQL>;

  /**
   * @title Custom Attributes on Product
   * @description Inform the product own custom attributes
   */
  customAttributes?: Array<string>;

  /**
   * @title Maximum number of installments
   */
  maxInstallments: number;

  /**
   * @title Minimum installment value
   */
  minInstallmentValue: number;

  /**
   * @title Enale Cache in APIs (Deco Stale)
   * @default true
   */
  enableCache: boolean;

  /**
   * @title Cart Configs
   */
  cartConfigs: CartConfigs;

  /**
   * @title Features
   */
  features: Features;
}

interface CartConfigs {
  /**
   * @title Enable create Cart on add item fist time
   * @default false
   */
  createCartOnAddItem: boolean;

  /**
   * @title Count Product Image in Cart
   * @default 1
   */
  countProductImageInCart: number;

  /**
   * @title Change card ID after checkout
   * @description During checkout, the cartId may change without being updated in the cookie. When activating this option, each loader or action called on the page will check that the cartId does not have a different cookie than the checkout cartId. For greater efficiency, we recommend implementing a script on the front end to perform this validation and disabling this option on the back end.
   * @default false
   */
  changeCardIdAfterCheckout: boolean;

}

export interface Features {
  /**
   * @title DANGEROUSLY Return null after cart action
   * @description When called, the action will return just an success statement
   * @default false
   */
  dangerouslyReturnNullAfterAction: boolean;

  /**
   * @title DANGEROUSLY Disable OnVisibilityChange Update
   * @description After an idle, the store state will not be updated
   * @default false
   */
  dangerouslyDisableOnVisibilityChangeUpdate: boolean;
  /**
   * @title DANGEROUSLY Disable onLoad Update
   * @description After a page load/refresh, the store state will not be updated
   * @default false
   */
  dangerouslyDisableOnLoadUpdate: boolean;
}

export interface State extends Props {
  clientAdmin: ReturnType<typeof createHttpClient<API>>;
  clientGraphql: ReturnType<typeof createGraphqlClient>;
}

/**
 * @title Magento
 * @description Loaders, actions and workflows for adding Magento Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://avatars.githubusercontent.com/u/168457?s=200&v=4
 */
export default function App(props: Props): App<Manifest, State> {
  const { baseUrl, apiKey } = props;

  const clientAdmin = createHttpClient<API>({
    base: baseUrl,
    headers: new Headers({
      Authorization: `Bearer ${apiKey}`,
    }),
  });

  const clientGraphql = createGraphqlClient({
    fetcher: fetchSafe,
    endpoint: `${baseUrl}/graphql`,
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
  });
  return {
    manifest,
    state: {
      ...props,
      clientAdmin,
      clientGraphql,
    },
    middleware,
  };
}

export type AppContext = FnContext<State, Manifest>;
export type AppMiddlewareContext = AMC<ReturnType<typeof App>>;
