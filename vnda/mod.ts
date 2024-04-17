import type { App, FnContext } from "deco/mod.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { OpenAPI } from "./utils/openapi/vnda.openapi.gen.ts";
import type { Secret } from "../website/loaders/secret.ts";
import type { AppMiddlewareContext as AMC } from "deco/mod.ts";
import { middleware } from "./middleware.ts";

export type AppMiddlewareContext = AMC<ReturnType<typeof VNDA>>;

export type AppContext = FnContext<State, Manifest>;

/** @title VNDA */
export interface Props {
  /**
   * @title VNDA Account name
   * @description The name that comes before the cdn.vnda, deco on deco.cdn.vnda.com.br
   * @default deco
   */
  account: string;

  /**
   * @title Public store URL
   * @description Domain that is registered on VNDA
   * @default www.mystore.com.br
   */
  publicUrl: string;

  /**
   * @description The token generated from admin panel. Read here: https://developers.vnda.com.br/docs/chave-de-acesso-e-requisicoes. Do not add any other permissions than catalog.
   */
  authToken: Secret;

  /**
   * @title Use Sandbox
   * @description Define if sandbox environment should be used
   */
  sandbox: boolean;

  /**
   * @description Use VNDA as backend platform
   */
  platform: "vnda";

  /** @description Here is to put the pathname of the Search Page. Ex: /s. We have default values: "/busca" or "/s" */
  searchPagePath?: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<OpenAPI>>;
}

export const color = 0x0C29D0;

/**
 * @title VNDA
 * @description Loaders, actions and workflows for adding VNDA Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/vnda/logo.png
 */
export default function VNDA(props: Props): App<Manifest, State> {
  const { authToken, publicUrl, sandbox } = props;
  const stringAuthToken = typeof authToken === "string"
    ? authToken
    : authToken?.get?.() ?? "";
  const api = createHttpClient<OpenAPI>({
    headers: new Headers({
      "User-Agent": "decocx/1.0",
      "X-Shop-Host": publicUrl,
      "accept": "application/json",
      authorization: `Bearer ${stringAuthToken}`,
    }),
    base: sandbox
      ? "https://api.sandbox.vnda.com.br"
      : "https://api.vnda.com.br",
  });

  return {
    state: { ...props, api },
    manifest,
    middleware,
  };
}
