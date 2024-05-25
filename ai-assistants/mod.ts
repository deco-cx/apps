import AWS from "https://esm.sh/aws-sdk";
import { asResolved, isDeferred } from "deco/engine/core/resolver.ts";
import { isAwaitable } from "deco/engine/core/utils.ts";
import type { App, AppContext as AC } from "deco/mod.ts";
import { AvailableActions, AvailableLoaders } from "deco/utils/invoke.types.ts";
import { AppManifest } from "deco/types.ts";
import { deferred } from "std/async/deferred.ts";
import openai, {
  Props as OpenAIProps,
  State as OpenAIState,
} from "../openai/mod.ts";
import { Assistant } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";

export type GPTModel =
  | "gpt-4-0613"
  | "gpt-4-0314"
  | "gpt-4-1106-preview"
  | "gpt-4"
  | "gpt-3.5-turbo-1106"
  | "gpt-3.5-turbo-16k"
  | "gpt-3.5-turbo-16k-0613"
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0613";
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

  /**
   * Optional function to log the received messages from the user.
   * @param {Log} logInfo - User message / information.
   * @returns {void} - The modified properties.
   */
  onMessageReceived?: (logInfo: Log) => void;

  /**
   * Optional function to log the received messages sent by the assistant.
   * @param {Log} logInfo - Assistant message / information.
   * @returns {void} - The modified properties.
   */
  onMessageSent?: (logInfo: Log) => void;

  /**
   * The GPT model that will be used, if not specified the assistant model will be used.
   */
  model?: GPTModel | { custom: string };

  /**
   * The Id of the assistant
   */
  id?: string;

  /**
   * The Id of the assistant thread
   */
  threadId?: string;
}

export interface Log {
  assistantId: string;
  threadId: string;
  runId: string;
  model: string;
  message: object;
}

export interface Prompt {
  content: string;
  context: string;
}

export interface AssistantAwsProps {
  assistantBucketRegion: Secret;
  accessKeyId: Secret;
  secretAccessKey: Secret;
  assistantBucketName: Secret;
}

export interface Props extends OpenAIProps {
  /**
   * @description the assistant Id
   */
  assistantId: string;
  /**
   * @description Instructions
   */
  instructions?: string;
  assistants?: AIAssistant[];
  assistantAwsProps?: AssistantAwsProps;
  s3?: AWS.S3;
}

export interface State extends OpenAIState {
  instructions?: string;
  assistant: Promise<Assistant>;
  assistants: Record<string, Promise<AIAssistant>>;
  assistantAwsProps?: AssistantAwsProps;
  s3?: AWS.S3;
}

/**
 * @title Deco AI Assistant
 * @description Create AI assistants on deco.cx.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/ai-assistants/logo.png
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
        state.assistantId,
      ),
      s3: new AWS.S3({
        region: state.assistantAwsProps?.assistantBucketRegion.get?.() ??
          Deno.env.get("ASSISTANT_BUCKET_REGION"),
        accessKeyId: state.assistantAwsProps?.accessKeyId.get?.() ??
          Deno.env.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: state.assistantAwsProps?.secretAccessKey.get?.() ??
          Deno.env.get("AWS_SECRET_ACCESS_KEY"),
      }),
      assistantAwsProps: state.assistantAwsProps,
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
