//IMPORTS-------------------------------------------------------------
import { PreviewDecopilot } from "./preview/Preview.tsx";
import { Markdown } from "../decohub/components/Markdown.tsx";

import type { App as A, AppContext as AC, AppRuntime } from "@deco/deco";

import {
  Chain,
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
  chains: Chain[];
}

//APP-------------------------------------------------------------
/**
 * @title decopilot-app
 */
export default function Decopilot({
  credentials,
  content,
  chains,
  ...props
}: Props) {
  const deps = credentials.map(
    (credential) =>
      credential.llmProvider === "Anthropic"
        ? AnthropicApp({ apiKey: credential.key })
        : OpenAIApp({ apiKey: credential.key }),
  );

  const state = { ...props, content, chains };

  const ctx: A<Manifest, typeof state> = {
    state,
    manifest,
    dependencies: deps,
  };

  return ctx;
}
export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewDecopilot,
    props: {
      ...props,
      markdownContent,
    },
  };
};
