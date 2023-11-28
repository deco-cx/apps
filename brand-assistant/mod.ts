import type { AppContext as AC, App } from "deco/mod.ts";
import {
  Assistant,
} from "https://deno.land/x/openai@v4.19.1/resources/beta/assistants/assistants.ts";
import openai, {
  Props as OpenAIProps,
  State as OpenAIState,
} from "../openai/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

interface Prompt {
  context: string;
  message: string;
}
const ASSISTANT_ID = "asst_vwWNeBUSmBlKe88mXq7qlU7f";
export interface Props extends OpenAIProps {
  assistantId?: string;
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
interface State extends OpenAIState {
  instructions: string;
  assistant: Promise<Assistant>;
}
const BASE_INSTRUCTIONS =
  "You are a shopping assistant designed to help customers navigate our online store. Your primary role is to assist users in finding products, providing information about them, and answering any related queries. Always prioritize clear, concise, and helpful responses. Encourage users to ask questions about product specifications, availability, price comparisons, and general store policies. Be responsive to diverse customer needs and maintain a friendly, professional tone in all interactions. You are equipped to handle a wide range of inquiries, but if a question falls outside your scope, guide the customer to the appropriate customer service channel. Remember, your goal is to enhance the shopping experience by making it more efficient, informative, and user-friendly.";
/**
 * @title Brand Assistant
 */
export default function App(
  state: Props,
): App<Manifest, State, [ReturnType<typeof openai>]> {
  const openAIApp = openai(state);
  const instructions = `${BASE_INSTRUCTIONS}\n. ${state.botName ?  `Introduce yourself as ${state.botName}.`: ""}${state.instructions}`;
  const assistantsAPI = openAIApp.state.openAI.beta.assistants;
  return {
    manifest,
    state: {
      ...openAIApp.state,
      instructions,
      assistant: assistantsAPI.retrieve(ASSISTANT_ID),
    },
    dependencies: [openAIApp],
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
