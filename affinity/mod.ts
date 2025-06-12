import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import { AffinityAPI } from "./utils/client.ts";
import { Secret } from "../website/loaders/secret.ts";
import { ClientOf, createHttpClient } from "../utils/http.ts";

export interface Props {
  apiKey: Secret | string;
}

export interface State extends Props {
  client: ClientOf<AffinityAPI>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Affinity
 * @description Integração com Affinity
 * @category Produtividade
 * @logo https://affinity.co/favicon.ico
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const client = createHttpClient<AffinityAPI>({
    base: "https://api.affinity.co",
    headers: new Headers({
      "Authorization": `Basic ${btoa(`:${props.apiKey}`)}`,
    }),
  });

  const state: State = {
    ...props,
    client,
  };

  return {
    state,
    manifest,
  };
}
