import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import OpenAI from "npm:openai";
import { Secret } from "../website/loaders/secret.ts";

export interface State {
  openAI: OpenAI;
}

export interface Props {
  /**
   * @description Your OpenAI API key
   */
  apiKey: Secret | string;
}

/**
 * @title OpenAI
 * @name OpenAI
 * @description OpenAI API integration for text and image generation
 * @category AI
 * @logo https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1024px-OpenAI_Logo.svg.png
 */
export default function OpenAIApp(props: Props): App<Manifest, State> {
  const { apiKey } = props;

  const openAI = new OpenAI({
    apiKey: typeof apiKey === "string" ? apiKey : apiKey.get() || "",
  });

  return {
    state: {
      openAI,
    },
    manifest,
    dependencies: [],
  };
}

export type OpenAIApp = ReturnType<typeof OpenAIApp>;
export type AppContext = AC<OpenAIApp>;
