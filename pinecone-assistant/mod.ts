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

const PINECONE_API_VERSION = "2025-10";

/**
 * @title Pinecone Assistant
 * @appName pinecone-assistant
 * @description Build conversational agents using vector search from Pinecone.
 * @category IA
 * @logo https://assets.decocache.com/mcp/57d30250-ed40-4f13-8b50-3a5ddff95ca0/Pinecone.svg
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
      "X-Pinecone-API-Version": PINECONE_API_VERSION,
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
