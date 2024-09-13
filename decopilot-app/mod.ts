//IMPORTS-------------------------------------------------------------
import type {
  App as A,
  AppContext as AC,
  // ManifestOf,
} from "deco/mod.ts";

import {
  Credentials,
  LLMClient,
  // LLMResponseType,
  Prompt,
  Provider,
} from "./types.ts";

import manifest, { Manifest } from "./manifest.gen.ts";

import OpenAIApp, {
  Props as _OpenAIProps,
  State as _OpenAIState,
} from "../openai/mod.ts";

import AnthropicApp, {
  Props as _AnthropicProps,
  State as _AnthropicState,
} from "../anthropic/mod.ts";

import _assembleFinalPrompt from "./utils/assembleComplexPrompt.ts";
import { AnthropicClient, OpenAIClient } from "./clients/llmClientObjects.ts";


//EXPORTS-------------------------------------------------------------

// export type AppManifest = ManifestOf<App>;

export type App = ReturnType<typeof Decopilot>;
export type AppContext = AC<App>;

export interface Props {
  credentials: Credentials[];
  content: Prompt[];
}
//APP-------------------------------------------------------------
/**
 * @title decopilot-app
 */
export default function Decopilot({
  credentials,
  content,
  ...props
}: Props) {

  // const deps = credentials.map(
  //   credential => 
  //   )

  const openAIApp = OpenAIApp({ apiKey: credentials.key });
  const anthropicApp = AnthropicApp({ apiKey: credentials.key });

  const providers: Record<Provider, LLMClient> = {
    Anthropic: new AnthropicClient("Anthropic", anthropicApp),
    Openai: new OpenAIClient("Openai", openAIApp),
  };

  const llmClient = providers[credentials.llmProvider];


  const state = {
    ...props,
    content,
    llmClient,
  };

  const ctx: A<Manifest, typeof state> = {
    state,
    manifest,
    dependencies: [
      anthropicApp,
      openAIApp,
    ],
  };

  return ctx;
}
