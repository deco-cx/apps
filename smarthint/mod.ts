import type { App, AppContext as AC } from "deco/mod.ts";
import manifest from "./manifest.gen.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { OpenAPI } from "./utils/openapi/smarthint.openapi.gen.ts";

export interface State {
  // you can freely change this to accept new properties when installing this app
  exampleProp: string;

  shcode: string;

  cluster: string;
}
/**
 * @title smarthint
 */
export default function App(
  props: State,
) {
  const headers = new Headers();
  headers.set("accept", "application/json");
  headers.set("content-type", "application/json");
  headers.set("Cache-Control", "no-cache");
  // headers.set("Authorization", "wapstore");

  const api = createHttpClient<OpenAPI>({
    base: "https://searches.smarthint.co/",
    fetcher: fetchSafe,
    headers: headers,
  });

  const state = {
    ...props,
    api,
  };

  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
