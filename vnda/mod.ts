import type { App, FnContext } from "$live/mod.ts";
import manifest, { Manifest, name } from "./manifest.gen.ts";
import { createClient } from "./utils/client/client.ts";

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
  authToken: string;

  /**
   * @title Use Sandbox
   * @description Define if sandbox environment should be used
   */
  sandbox: boolean;

  /**
   * @description Use VNDA as backend platform
   */
  platform: "vnda";
}

export interface State extends Props {
  client: ReturnType<typeof createClient>;
}

/**
 * @title VNDA
 */
export default function App(props: Props): App<Manifest, State> {
  return {
    name,
    state: {
      ...props,
      client: createClient(props),
    },
    manifest,
  };
}
