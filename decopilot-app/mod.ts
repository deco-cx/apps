import type {
  App as A,
  AppContext as AC,
  ManifestOf,
  // AppMiddlewareContext as AMC,
  // AppRuntime,
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

// import workflow from "../workflows/mod.ts";

export type App = ReturnType<typeof Decopilot>;
export type AppContext = AC<App>;
export type AppManifest = ManifestOf<App>;
// export type AppMiddlewareContext = AMC<App>;

export interface Props {
  credentials: Credentials;
  // you can freely change this to accept new properties when installing this app
  // exampleProp: string;

  content: Prompt[];
}

/**
 * @title decopilot-app
 */
export default function Decopilot({
  credentials,
  content,
  ...props
}: Props) {
  const openAIApp = OpenAIApp({ apiKey: credentials.key });
  const anthropicApp = AnthropicApp({ apiKey: credentials.key });

  const providers: Record<Provider, LLMClient> = {
    Anthropic: new AnthropicClient("Anthropic", anthropicApp),
    Openai: new OpenAIClient("Openai", openAIApp),
  };

  // Function to get the appropriate LLM client based on the provider key
  // function getLLMClient(provider: Provider): LLMClient {
  //   switch (provider) {
  //     case 'Anthropic':
  //       return providers.Anthropic;
  //     case 'Openai':
  //       return providers.Openai;
  //     default:
  //       throw new Error(`Unsupported provider: ${provider}`);
  //   }
  // }
  const llmClient = providers[credentials.llmProvider];
  // const llmClient = getLLMClient(credentials.llmProvider);

  // Call the LLM client with the prompt
  // const llm = llmClient.call(prompt);

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

// export const preview = async (props: AppRuntime) => {
//   const markdownContent = await Markdown(
//     new URL("./README.md", import.meta.url).href,
//   );
//   return {
//     Component: PreviewVtex,
//     props: {
//       ...props,
//       markdownContent,
//     },
//   };
// };
