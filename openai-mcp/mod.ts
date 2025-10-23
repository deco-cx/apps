import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import OpenAI from "npm:openai@6.2.0";
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
 * @title OpenAI Imagen
 * @name OpenAI Imagen
 * @description Generate detailed images from natural language prompts.
 * @category AI
 * @logo https://assets.decocache.com/mcp/1449ff20-a110-4753-81a1-4c116ba39336/OpenAI-Imagen.svg
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
