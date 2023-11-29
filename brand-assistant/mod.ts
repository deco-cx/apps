import type { App, AppContext as AC } from "deco/mod.ts";
import assistant, {
  Props as AIAssistantProps,
  State as AIAssistantState,
} from "../ai-assistants/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props extends Omit<AIAssistantProps, "assistantId"> {
  assistantId?: string;
}
const ASSISTANT_ID = "asst_vwWNeBUSmBlKe88mXq7qlU7f";

const BASE_INSTRUCTIONS =
  "You are a shopping assistant designed to help customers navigate our online store. Your primary role is to assist users in finding products, providing information about them, and answering any related queries. Always prioritize clear, concise, and helpful responses. Encourage users to ask questions about product specifications, availability, price comparisons, and general store policies. Be responsive to diverse customer needs and maintain a friendly, professional tone in all interactions. You are equipped to handle a wide range of inquiries, but if a question falls outside your scope, guide the customer to the appropriate customer service channel. Remember, your goal is to enhance the shopping experience by making it more efficient, informative, and user-friendly.";
/**
 * @title Brand Assistant
 */
export default function App(
  state: Props,
): App<Manifest, AIAssistantState, [ReturnType<typeof assistant>]> {
  const assistantApp = assistant({
    ...state,
    instructions: BASE_INSTRUCTIONS,
    assistantId: ASSISTANT_ID,
  });
  return {
    manifest,
    state: assistantApp.state,
    dependencies: [assistantApp],
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
