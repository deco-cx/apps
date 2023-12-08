import type { App, AppContext as AC } from "deco/mod.ts";
import { Secret } from "../website/loaders/secret.ts";
import { OpenAI } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  apiKey?: Secret;
}

export interface State {
  openAI: OpenAI;
}

/**
 * @title OpenAI
 */
export default function App(
  state: Props,
): App<Manifest, State> {
  return {
    manifest,
    state: {
      openAI: new OpenAI({ apiKey: state.apiKey?.get() ?? undefined }),
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
