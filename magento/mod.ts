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

export interface APIConfig {
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
   * @title Enale Cache in APIs (Deco Stale)
   * @default true
   */
  enableCache: boolean;

  /**
   * @title Use Magento store prop as URL path suffix in PDP
   */
  useSuffix: boolean;
}

export interface ImagesConfig {
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
}

export interface CustomProps {
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
}

export interface PricingConfig {
  /**
   * @title Maximum number of installments
   */
  maxInstallments: number;

  /**
   * @title Minimum installment value
   */
  minInstallmentValue: number;
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
}

export interface Props {
  /**
   * @title API config
   * @description Full API Props
   */
  apiConfig: APIConfig;

  /**
   * @title Images config
   * @description Images config in PDP, PLP and shelves
   */
  imagesConfig: ImagesConfig;

  /**
   * @title Custom Props
   * @description Use your ow props in product
   */
  productCustomProps: CustomProps;

  /**
   * @title Pricing config in product
   */
  pricingConfig: PricingConfig;

  /**
   * @title Cart Configs
   */
  cartConfigs: CartConfigs;
}

export type State =
  & {
    clientAdmin: ReturnType<typeof createHttpClient<API>>;
    clientGraphql: ReturnType<typeof createGraphqlClient>;
    cartConfigs: CartConfigs;
  }
  & APIConfig
  & ImagesConfig
  & CustomProps
  & PricingConfig;

/**
 * @title Magento
 * @description Loaders, actions and workflows for adding Magento Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://avatars.githubusercontent.com/u/168457?s=200&v=4
 */
export default function App(props: Props): App<Manifest, State> {
  const {
    apiConfig,
    imagesConfig,
    productCustomProps,
    pricingConfig,
    cartConfigs
  } = props;

  const clientAdmin = createHttpClient<API>({
    base: apiConfig.baseUrl,
    headers: new Headers({
      Authorization: `Bearer ${apiConfig.apiKey}`,
    }),
  });

  const clientGraphql = createGraphqlClient({
    fetcher: fetchSafe,
    endpoint: `${apiConfig.baseUrl}/graphql`,
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiConfig.apiKey}`,
    }),
  });
  return {
    manifest,
    state: {
      ...apiConfig,
      ...imagesConfig,
      ...productCustomProps,
      ...pricingConfig,
      cartConfigs,
      clientAdmin,
      clientGraphql,
    },
    middleware,
  };
}

export type AppContext = FnContext<State, Manifest>;
export type AppMiddlewareContext = AMC<ReturnType<typeof App>>;
