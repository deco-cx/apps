import type { App, AppContext as AC } from "deco/mod.ts";
import { createFetchRequester } from "npm:@algolia/requester-fetch@4.20.0";
import algolia from "npm:algoliasearch@4.20.0";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = AC<ReturnType<typeof App>>;

export interface State {
  /**
   * @title Your Algolia App ID
   * @description https://dashboard.algolia.com/account/api-keys/all
   */
  applicationId: string;

  /**
   * @title Search API Key
   * @description https://dashboard.algolia.com/account/api-keys/all
   * @format password
   */
  searchApiKey: string;

  /**
   * @title Admin API Key
   * @description https://dashboard.algolia.com/account/api-keys/all
   * @format password
   */
  adminApiKey: Secret;
}

/**
 * @title Algolia
 * @description Product search & discovery that increases conversions at scale.
 * @category Search
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/algolia/logo.png
 */
export default function App(
  props: State,
) {
  const { applicationId, adminApiKey, searchApiKey } = props;

  if (!adminApiKey) {
    throw new Error("Missing admin API key");
  }

  const stringAdminApiKey = typeof adminApiKey === "string"
    ? adminApiKey
    : adminApiKey?.get?.() ?? "";

  const client = algolia.default(applicationId, stringAdminApiKey, {
    requester: createFetchRequester(), // Fetch makes it perform mutch better
  });

  const state = { client, applicationId, searchApiKey };

  const app: App<Manifest, typeof state> = {
    manifest: {
      ...manifest,
      actions: {
        ...manifest.actions,
        "algolia/actions/setup.ts": {
          ...manifest.actions["algolia/actions/setup.ts"],
          default: (p, req, ctx) =>
            manifest.actions["algolia/actions/setup.ts"].default(
              { applicationId, adminApiKey: stringAdminApiKey, ...p },
              req,
              ctx,
            ),
        },
      },
    },
    state,
  };

  return app;
}
