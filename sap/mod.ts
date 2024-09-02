import type { App, FnContext } from "deco/mod.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client/client.ts";

export type AppContext = FnContext<State, Manifest>;

/** @title */
export interface Props {
  /**
   * @title Api url
   * @default https://api.lisacx.com.br:9002/occ/v2
   */
  apiUrl: string;

  /**
   * @title Base site ID
   * @default apparel-uk-spa
   */
  baseSiteId: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<API>>;
}

/**
 * @title SAP
 * @description
 * @category Ecommmerce
 * @logo https://fakestoreapi.com/icons/logo.png
 */
export default function SAP(props: Props): App<Manifest, unknown> {
  const { apiUrl, baseSiteId } = props;

  const api = createHttpClient<API>({
    base: `${apiUrl}/${baseSiteId}/` ||
      "https://apolloapi.electrolux.com/occ/v2/frigidaire",
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  });

  return {
    state: { ...props, api },
    manifest,
  };
}
