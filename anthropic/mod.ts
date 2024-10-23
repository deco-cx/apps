import { Secret } from "../website/loaders/secret.ts";
import { Anthropic } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { type App, type AppContext as AC } from "@deco/deco";
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
 * @description Interact with the Anthropic API.
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
