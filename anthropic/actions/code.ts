import { shortcircuit } from "@deco/deco";
import { AppContext } from "../mod.ts";
import { Anthropic } from "../deps.ts";

export const allowedModels = [
  "claude-3-5-sonnet-20240620",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  "claude-2.1",
  "claude-2.0",
  "claude-instant-1.2",
] as const;

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
  model?: typeof allowedModels[number];
  /**
   * @description The maximum number of tokens to generate.
   *
   * Different models have different maximum values for this parameter. See
   * [models](https://docs.anthropic.com/en/docs/models-overview) for details.
   */
  max_tokens?: number;
  temperature?: number;
}

export default async function chat(
  {
    system,
    messages,
    model = "claude-3-opus-20240229",
    max_tokens = 4096,
    temperature = 0.0,
  }: Props,
  _req: Request,
  ctx: AppContext,
) {
  if (!messages) {
    return shortcircuit(new Response("No messages provided", { status: 400 }));
  }

  const msg = await ctx.anthropic.messages.create({
    system,
    model,
    max_tokens,
    messages,
    temperature,
  });

  return msg;
}
