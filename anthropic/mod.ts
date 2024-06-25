import type { App, AppContext as AC } from "deco/mod.ts";
import { Secret } from "../website/loaders/secret.ts";
import { Anthropic } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  /**
   * @title Anthropic API Key
   */
  apiKey?: Secret;
}

export interface State {
  anthropic: Anthropic;
  token?: string;
}

/**
 * @title Anthropic
 */
export default function App(state: Props): App<Manifest, State> {
  const getToken = state?.apiKey?.get;
  const token = typeof getToken === "function"
    ? getToken() ?? undefined
    : undefined;
  return {
    manifest,
    state: {
      token,
      anthropic: new Anthropic({
        apiKey: token,
      }),
    },
  };
}
export type AnthropicApp = ReturnType<typeof App>;
export type AppContext = AC<AnthropicApp>;
