import type { App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createHttpClient } from "../utils/http.ts";
import { OpenAPI } from "./utils/openapi/api.openapi.gen.ts";
import { fetchSafe } from "../utils/fetch.ts";

export const color = 0xfe5000;

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<OpenAPI>>;
}

export type AppContext = FnContext<State, Manifest>;

/** @title Wap */
export interface Props {
  /**
   * @description Use Wap as backend platform
   */
  platform: "wap";
  /**
   * @description URL of wap native environment
   */
  baseUrl: string;
}

/**
 * @title Wap
 * @description Loaders, actions and workflows for adding Wap Commerce Platform to your website.
 * @category Ecommmerce
 */
export default function App(
  props: Props,
): App<Manifest, Props> {
  const headers = new Headers();
  headers.set("accept", "application/json");
  headers.set("content-type", "application/json");
  headers.set("Cache-Control", "no-cache");
  headers.set("App-Token", "wapstore");

  const api = createHttpClient<OpenAPI>({
    base: props.baseUrl,
    fetcher: fetchSafe,
    headers: headers,
  });

  const state = {
    ...props,
    api,
  };

  return { manifest, state };
}
