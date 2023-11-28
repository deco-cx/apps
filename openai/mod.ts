import type { App, AppContext as AC } from "deco/mod.ts";
import OpenAI from "https://deno.land/x/openai@v4.19.1/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  apiKey?: string;
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
      openAI: new OpenAI({
        apiKey: "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",
        ...state,
      }),
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
