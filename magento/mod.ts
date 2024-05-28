import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client/client.ts";
import { createHttpClient } from "../utils/http.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { fetchSafe } from "../utils/fetch.ts";

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
   * @description Application own filters
   */
  customFilters: Array<FiltersGraphQL>;

  /**
   * @title Maximum number of installments
   */
  maxInstallments: number;

  /**
   * @title Minimum installment value
   */
  minInstallmentValue: number;
}

type PartialProps = Omit<Props, "baseUrl">;

export interface State extends PartialProps {
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
  const {
    baseUrl,
    site,
    storeId,
    apiKey,
    currencyCode,
    imagesUrl,
    imagesQtd,
    customFilters = [],
    maxInstallments,
    minInstallmentValue,
    useSuffix
  } = props;

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
      site,
      storeId,
      apiKey,
      currencyCode,
      imagesUrl,
      clientAdmin,
      clientGraphql,
      imagesQtd,
      customFilters,
      maxInstallments,
      minInstallmentValue,
      useSuffix
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
