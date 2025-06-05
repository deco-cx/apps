import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import { Secret } from "../website/loaders/secret.ts";
import { ClientOf, createHttpClient } from "../utils/http.ts";
import { PineconeAPI } from "./utils/client.ts";

export interface Props {
  /**
   * @description Pinecone API key
   */
  apiKey: Secret | string;

  /**
   * @description Pinecone API host
   */
  host: string;

  /**
   * @description Assistant name
   */
  assistant: string;
}

export interface State extends Props {
  client: ClientOf<PineconeAPI>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Pinecone Assistant
 * @description Pinecone Assistant integration
 * @category IA
 * @logo https://avatars.githubusercontent.com/u/54333248?s=200&v=4
 */
export default function App(
  props: Props,
  _req: Request,
  _ctx?: McpContext<Props>,
) {
  const apiKey = typeof props.apiKey === "string"
    ? props.apiKey
    : props.apiKey.get();

  const client = createHttpClient<PineconeAPI>({
    base: props.host,
    headers: new Headers({
      "Api-Key": apiKey ?? "",
      "Content-Type": "application/json",
      "X-Pinecone-API-Version": "2025-01-01",
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
