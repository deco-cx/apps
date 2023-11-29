import type { AppContext as AC, App } from "deco/mod.ts";
import { OpenAI } from "./deps.ts";
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
        apiKey: "PLACE_HOLDER",
        ...state,
      }),
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
