//IMPORTS-------------------------------------------------------------
import type { App as A, AppContext as AC } from "deco/mod.ts";

import {
  Credentials,
  // LLMResponseType,
  Prompt,
} from "./types.ts";

import manifest, { Manifest } from "./manifest.gen.ts";

import OpenAIApp from "../openai/mod.ts";

import AnthropicApp from "../anthropic/mod.ts";

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
  const deps = credentials.map(
    (credential) =>
      credential.llmProvider === "Anthropic"
        ? AnthropicApp({ apiKey: credential.key })
        : OpenAIApp({ apiKey: credential.key }),
  );

  const state = { ...props, content };

  const ctx: A<Manifest, typeof state> = {
    state,
    manifest,
    dependencies: deps,
  };

  return ctx;
}
