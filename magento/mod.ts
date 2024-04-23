import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { Secret } from "../website/loaders/secret.ts";

export interface State {
  /** @title Magento api url */
  basaUrl: string;

  /** @title Magento api key */
  apiKey: Secret;
}

/**
 * @title Magento
 * @description Loaders, actions and workflows for adding Magento Commerce Platform to your website.
 * @category Ecommmerce
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
