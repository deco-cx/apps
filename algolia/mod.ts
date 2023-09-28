import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { setupProductsIndices } from "./utils/product.ts";

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
   * @format password
   */
  adminApiKey: string;
}

/**
 * @title algolia
 */
export default function App(
  props: State,
) {
  const promise = setupProductsIndices(props);
  const state = { getClient: () => promise };

  const app: App<Manifest, typeof state> = { manifest, state };

  return app;
}
