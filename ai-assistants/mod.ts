import { asResolved, isDeferred } from "deco/engine/core/resolver.ts";
import { isAwaitable } from "deco/engine/core/utils.ts";
import type { App, AppContext as AC } from "deco/mod.ts";
import {
  AvailableActions,
  AvailableLoaders,
} from "deco/routes/live/invoke/index.ts";
import { AppManifest } from "deco/types.ts";
import { deferred } from "std/async/deferred.ts";
import openai, {
  Props as OpenAIProps,
  State as OpenAIState,
} from "../openai/mod.ts";
import { Assistant } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

/**
 * Represents an AI Assistant with specific capabilities and configurations.
 * @template TManifest - The type of the AppManifest associated with the AI Assistant.
 */
export interface AIAssistant<TManifest extends AppManifest = AppManifest> {
  /**
   * The name of the AI Assistant.
   */
  name: string;

  /**
   * Optional instructions or guidelines for the AI Assistant.
   */
  instructions?: string;

  /**
   * Optional array of prompts to provide context for the AI Assistant.
   */
  prompts?: Prompt[];

  /**
   * Optional welcome message to be displayed when the chat session starts.
   */
  welcomeMessage?: string;

  /**
   * Optional list of available functions (actions or loaders) that the AI Assistant can perform.
   * @type {Array<AvailableActions<TManifest> | AvailableLoaders<TManifest>>}
   */
  availableFunctions?: Array<
    AvailableActions<TManifest> | AvailableLoaders<TManifest>
  >;

  /**
   * Optional function to customize the handling of properties (props) passed to the AI Assistant.
   * It takes a set of properties and returns a modified set of properties.
   * @param {unknown} props - The properties passed to the AI Assistant.
   * @returns {unknown} - The modified properties.
   */
  useProps?: (props: unknown) => unknown;
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
