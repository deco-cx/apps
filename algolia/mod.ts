import algolia, { SearchClient } from "npm:algoliasearch@4.20.0";
import { createFetchRequester } from "npm:@algolia/requester-fetch@4.20.0";
import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = AC<ReturnType<typeof App>>;

export interface State {
  /**
   * @title Your Algolia App ID
   * @description https://dashboard.algolia.com/account/api-keys/all
   */
  applicationId: string;

  /**
   * @title Admin API Key
   * @description https://dashboard.algolia.com/account/api-keys/all
   */
  adminAPIKey: string;

  /**
   * @title Search API Key
   * @description https://dashboard.algolia.com/account/api-keys/all
   */
  searchAPIKey: string;
}

export type Indices = "products" | "products_price_desc" | "products_price_asc";

const setup = async (algolia: SearchClient) => {
  await algolia.initIndex("products" satisfies Indices).setSettings({
    searchableAttributes: [
      "name",
      "description",
      "brand.name",
      "isVariantOf.name",
      "isVariantOf.model",
      "offers.offers.availability",
      "offers.offers.priceSpecification.priceType",
      "offers.offers.priceSpecification.priceComponentType",
    ],
    attributesForFaceting: [
      "brand.name",
      "category",
    ],
    numericAttributesForFiltering: [
      "offers.highPrice",
      "offers.lowPrice",
      "offers.offers.price",
      "offers.offers.priceSpecification.price",
    ],
    replicas: [
      "virtual(products_price_desc)",
      "virtual(products_price_asc)",
    ],
  });

  await algolia.initIndex("products_price_desc" satisfies Indices).setSettings({
    customRanking: [
      "desc(offers.lowPrice)",
    ],
  });

  await algolia.initIndex("products_price_asc" satisfies Indices).setSettings({
    customRanking: [
      "asc(offers.lowPrice)",
    ],
  });
};

/**
 * @title algolia
 */
export default function App(
  props: State,
) {
  const { applicationId, adminAPIKey } = props;
  const client = algolia.default(applicationId, adminAPIKey, {
    requester: createFetchRequester(), // Fetch makes it perform mutch better
  });
  const promise = setup(client);

  const getIndex = async (index: Indices) => {
    await promise;

    return client.initIndex(index);
  };

  const state = { ...props, algolia: getIndex };

  const app: App<Manifest, typeof state> = { manifest, state };

  return app;
}
