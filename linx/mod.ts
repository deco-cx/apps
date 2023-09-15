import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createHttpClient } from "../utils/http.ts";
import { API } from "./utils/client.ts";

/** @title LINX */
export interface Props {
  /**
   * @title LINX Account name
   * @default deco
   */
  account: string;

  /**
   * @title LINX Account Username
   * @default deco
   */
  username: string;

  /**
   * @title LINX Account Password
   * @default deco
   */
  // password: Secret;
  password: string;

  /**
   * @title Public store URL
   * @description Domain that is registered on LINX
   * @default www.mystore.com.br
   */
  publicUrl: string;

  /**
   * @title CDN store Linx
   * @default cdn.cloudfront.net
   */
  cdnUrl: string;

  /**
   * @description Use LINX as backend platform
   */
  platform: "linx";
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<API>>;
}

/**
 * @title linx
 */
export default function App(
  state: Props,
): App<Manifest, State> {
  const api = createHttpClient<API>({
    headers: new Headers({
      "User-Agent": "decocx/1.0",
      "accept": "application/json",
      authorization: `Basic ${btoa(`${state.username}:${state.password}`)}`,
    }),
    base: `https://${state.account}.core.dcg.com.br/`,
  });

  return {
    state: { ...state, api },
    manifest,
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
