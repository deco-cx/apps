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
 * @name Perplexity
 * @description Integrate with Perplexity AI's powerful chat completion models
 * @category AI and Machine Learning
 * @logo https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F25175a25-0287-48d2-b577-ac6f3f00a522_400x400.jpeg
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
