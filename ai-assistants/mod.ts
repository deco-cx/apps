import type { Loader } from "deco/blocks/loader.ts";
import type { App, AppContext as AC } from "deco/mod.ts";
import openai, {
  Props as OpenAIProps,
  State as OpenAIState,
} from "../openai/mod.ts";
import { Assistant } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

interface Prompt {
  content: string | Loader;
  context: string;
}

export interface Props extends OpenAIProps {
  assistantId: string;
  /**
   * @description The name of the brand assistant
   */
  botName?: string;
  /**
   * @description Instructions
   */
  instructions?: string;
  prompts?: Prompt[];
}

export interface State extends OpenAIState {
  instructions?: string;
  assistant: Promise<Assistant>;
}
/**
 * @title Brand Assistant
 */
export default function App(
  state: Props,
): App<Manifest, State, [ReturnType<typeof openai>]> {
  const openAIApp = openai(state);
  const assistantsAPI = openAIApp.state.openAI.beta.assistants;
  return {
    manifest,
    state: {
      ...openAIApp.state,
      instructions: `${state.instructions ?? ""}\n. ${
        state.botName ? `Introduce yourself as ${state.botName}.` : ""
      }`,
      assistant: assistantsAPI.retrieve(state.assistantId),
    },
    dependencies: [openAIApp],
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
