import {
  type App,
  type AppMiddlewareContext as AMC,
  type FnContext,
} from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client/client.ts";
import { createHttpClient } from "../utils/http.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { middleware } from "./middleware.ts";
import { Secret } from "../website/loaders/secret.ts";
import { ExtensionOf } from "../website/loaders/extension.ts";
import { Cart } from "./loaders/cart.ts";

export interface FiltersGraphQL {
  value: string;
  type: "EQUAL" | "MATCH" | "RANGE";
}

export interface APIConfig {
  /**
   * @title Magento API URL
   * @description The base URL of the Magento API, If you have stores, put the name of the store at the end.
   * @example https://magento.com/rest/store1 or https://magento.com/rest
   */
  baseUrl: string;

  /** @title Magento API key */
  apiKey: Secret;

  /** @title Magento store */
  site: string;

  /** @title Magento store ID */
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
   * @title Use "Magento store" prop as URL path suffix in details pages
   */
  useSuffix: boolean;
  /**
   * @title Choose what data to use in "Store" header in GraphQL
   */
  storeHeader: "storeId" | "site" | "none";
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
   * @description Max images quantity per shelf
   * @default 3
   */
  imagesQtd: number;
}

export interface CustomProps {
  /**
   * @title Custom Filters
   * @description Store custom filters
   */
  customFilters: Array<FiltersGraphQL>;

  /**
   * @title Custom Attributes
   * @description Inform the product custom attributes
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
   * @title Images per product in cart
   * @default 1
   */
  countProductImageInCart: number;
  /**
   * @title Change card ID after checkout
   * @description During checkout, the cartId may change without being updated in the cookie. When activating this option, each loader or action called on the page will check that the cartId does not have a different cookie than the checkout cartId. For greater efficiency, we recommend implementing a script on the front end to perform this validation and disabling this option on the back end.
   * @default false
   */
  changeCardIdAfterCheckout: boolean;
  /**
   * @title Cart extensions
   * @description Extend the cart invoke directly.
   */
  extensions: ExtensionOf<Cart | null>[];
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
  /**
   * @title DANGEROUSLY Disable Wishlist
   * @description After a page load/refresh, the wishlist state will not be updated
   * @default false
   */
  dangerouslyDisableWishlist: boolean;
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
   * @description Use custom properties in products query
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

  /**
   * @title Features
   * @description DANGEROUSLY ZONE. Do not change any setting, unless you are sure.
   */
  features: Features;
}

export type State =
  & {
    clientAdmin: ReturnType<typeof createHttpClient<API>>;
    clientGraphql: ReturnType<typeof createGraphqlClient>;
    cartConfigs: CartConfigs;
    features: Features;
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
export type AppType = ReturnType<typeof App>;

const getStoreHeader = (
  storeId: number,
  site: string,
  storeHeader: "storeId" | "site" | "none",
) => {
  const HEADER = {
    "storeId": String(storeId),
    "site": site,
  };

  if (storeHeader === "none") {
    return null;
  }

  return {
    "Store": HEADER[storeHeader],
  };
};

export default function App(props: Props): App<Manifest, State> {
  const {
    apiConfig,
    imagesConfig,
    productCustomProps,
    pricingConfig,
    cartConfigs,
    features,
  } = props;

  const { site, storeId, storeHeader } = apiConfig;

  const { apiKey } = apiConfig;

  const secretKey = typeof apiKey === "string" ? apiKey : apiKey?.get() ?? "";
  const headerGql = getStoreHeader(storeId, site, storeHeader);

  const clientAdmin = createHttpClient<API>({
    base: apiConfig.baseUrl,
    headers: new Headers({
      Authorization: `Bearer ${secretKey}`,
    }),
  });

  const clientGraphql = createGraphqlClient({
    fetcher: fetchSafe,
    endpoint: `${apiConfig.baseUrl}/graphql`,
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
      ...headerGql,
    }),
  });
  return {
    manifest,
    state: {
      ...apiConfig,
      ...imagesConfig,
      ...productCustomProps,
      ...pricingConfig,
      features,
      cartConfigs,
      clientAdmin,
      clientGraphql,
    },
    middleware,
  };
}

export type AppContext = FnContext<State, Manifest>;
export type AppMiddlewareContext = AMC<ReturnType<typeof App>>;

export { PreviewMagento as Preview } from "./preview/Preview.tsx";
