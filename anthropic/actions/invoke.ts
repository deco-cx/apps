import { shortcircuit } from "@deco/deco";
import { AppContext } from "../mod.ts";
import { Anthropic } from "../deps.ts";
import { getAppTools } from "../utils.ts";

export interface Props {
  /**
   * @description The system prompt to be used for the AI Assistant.
   */
  system?: string;
  /**
   * @description The messages to be processed by the AI Assistant.
   */
  messages: Anthropic.MessageParam[];
  /**
   * @description The model that will complete your prompt.
   */
  model?: Anthropic.Model;
  /**
   * @description The maximum number of tokens to generate.
   */
  max_tokens?: number;
  /**
   * @description Optional list of available functions (actions or loaders) that the AI Assistant can perform.
   */
  availableFunctions?: string[];
  /**
   * @description The tool choice to be used for the AI Assistant.
   */
  tool_choice?: Anthropic.MessageCreateParams["tool_choice"];
}

export default async function invoke(
  {
    system,
    messages,
    model = "claude-3-5-sonnet-20240620",
    max_tokens = 4096,
    availableFunctions = [],
    tool_choice = { type: "auto" },
  }: Props,
  _req: Request,
  ctx: AppContext,
) {
  if (!messages) {
    return shortcircuit(new Response("No messages provided", { status: 400 }));
  }

  const tools = await getAppTools(availableFunctions ?? []);

  const params: Anthropic.MessageCreateParams = {
    system,
    model,
    max_tokens,
    messages,
    tools,
    tool_choice,
  };

  try {
    const msg = await ctx.anthropic.messages.create(params);
    return msg;
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return shortcircuit(
      new Response("Error processing request", { status: 500 }),
    );
  }
}
