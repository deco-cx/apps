import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import type { RandomDataApi } from "./api-typings.d.ts";

export type Props = {
  /** @description Use https://random-data-api.com if not specified */
  rootEndpoint: string;
};

/**
 * @title random-product
 */
export default function App(
  { rootEndpoint }: Props,
) {
  const randomApi = createHttpClient<RandomDataApi>({
    base: `${rootEndpoint}`,
    headers: new Headers({
      'content-type': 'application/json'
    }),
    fetcher: fetchSafe,
  });

  const state = {
    randomApi,
  };

  const app: App<Manifest, typeof state> = {
    manifest,
    state,
  };
  return app;
}

export type AppContext = AC<ReturnType<typeof App>>;
