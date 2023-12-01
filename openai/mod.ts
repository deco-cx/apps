import type { App, AppContext as AC } from "deco/mod.ts";
import { OpenAI } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface VisionFineTunning {
  url: string;
  descriptions: string[];
}

export interface Props {
  apiKey?: string;
  visionFineTunning?: VisionFineTunning[];
}

export interface State {
  openAI: OpenAI;
  visionFineTunning: Record<string, string[]>;
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
      openAI: new OpenAI(state),
      visionFineTunning: (state.visionFineTunning ?? []).reduce(
        (acc, vision) => ({ [vision.url]: vision.descriptions, ...acc }),
        {},
      ),
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
