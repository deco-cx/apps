import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PerplexityClient, PerplexityModel } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API Key
   * @description Your Perplexity API key
   */
  apiKey?: string | Secret;

  /**
   * @title Default Model
   * @description The default model to use for completions (e.g. "sonar")
   * @default sonar
   */
  defaultModel?: PerplexityModel;
}

export interface State {
  api: ReturnType<typeof createHttpClient<PerplexityClient>>;
  defaultModel: PerplexityModel;
}

/**
 * @title Perplexity
 * @appName perplexity
 * @description Ask natural language questions and get grounded, web-backed answers.
 * @category AI and Machine Learning
 * @logo https://assets.decocache.com/mcp/1b3b7880-e7a5-413b-8db2-601e84b22bcd/Perplexity.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { apiKey, defaultModel = "sonar" } = props;

  const stringApiKey = typeof apiKey === "string"
    ? apiKey
    : apiKey?.get?.() ?? "";

  const api = createHttpClient<PerplexityClient>({
    base: "https://api.perplexity.ai",
    headers: new Headers({
      "Authorization": `Bearer ${stringApiKey}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state = { api, defaultModel };

  return {
    state,
    manifest,
  };
}
