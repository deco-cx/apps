import { asResolved, isDeferred } from "deco/engine/core/resolver.ts";
import { isAwaitable } from "deco/engine/core/utils.ts";
import type { App, AppContext as AC } from "deco/mod.ts";
import { deferred } from "std/async/deferred.ts";
import openai, {
  Props as OpenAIProps,
  State as OpenAIState,
} from "../openai/mod.ts";
import { Assistant } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface AIAssistant {
  name: string;
  instructions?: string;
  prompts?: Prompt[];
}

export interface Prompt {
  content: string;
  context: string;
}

export interface Props extends OpenAIProps {
  assistantId?: string;
  /**
   * @description Instructions
   */
  instructions?: string;
  assistants?: AIAssistant[];
}

export interface State extends OpenAIState {
  instructions?: string;
  assistant: Promise<Assistant>;
  assistants: Record<string, Promise<AIAssistant>>;
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
      assistants: (state.assistants ?? []).filter(Boolean).reduce(
        (acc, assistant) => {
          const assistantDeferred = deferred<AIAssistant>();
          if (isDeferred<AIAssistant>(assistant)) {
            const aiAssistant = assistant();
            if (isAwaitable(aiAssistant)) {
              aiAssistant.then(assistantDeferred.resolve).catch(
                assistantDeferred.reject,
              );
            } else {
              assistantDeferred.resolve(aiAssistant);
            }
          } else if (assistant) {
            assistantDeferred.resolve(assistant);
          }
          return { [assistant.name]: assistantDeferred, ...acc };
        },
        {},
      ),
      instructions: `${state.instructions ?? ""}`,
      assistant: assistantsAPI.retrieve(
        state.assistantId ?? "asst_vwWNeBUSmBlKe88mXq7qlU7f",
      ),
    },
    dependencies: [openAIApp],
  };
}

export const onBeforeResolveProps = (
  props: Props,
) => {
  if (Array.isArray(props?.assistants)) {
    return {
      ...props,
      assistants: props.assistants.map((assistant) =>
        asResolved(assistant, true)
      ),
    };
  }
  return props;
};

export type AppContext = AC<ReturnType<typeof App>>;
