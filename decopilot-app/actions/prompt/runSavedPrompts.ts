// import { shortcircuit } from "@deco/deco";
import { callAntropic, callOpenAI } from "../../clients/llmClientObjects.ts";
import type { AppContext } from "../../mod.ts";
import type { Attachment, LLMResponseType } from "../../types.ts";

interface Props {
  /**
   * @format dynamic-options
   * @options decopilot-app/loaders/listAvailablePrompts.ts
   */
  called_prompt: string;
  attachments?: Attachment[];
}

export default async function action(
  { called_prompt, attachments }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LLMResponseType> {
  const prompt = ctx.content.find((p) => p.name === called_prompt);

  if (!prompt) {
    throw new Error(`Prompt with Name: ${called_prompt} not found`);
  }

  if (prompt.provider === "Anthropic") {
    return await callAntropic(prompt, ctx, attachments ?? []);
  }

  if (prompt.provider === "OpenAI") {
    return await callOpenAI(prompt, ctx, attachments ?? []);
  }
  // if (prompt.provider === "Custom") {
  //   return await callCustomProvider(prompt, ctx, attachments);
  // }

  throw new Error(`Provider ${prompt.provider} is not supported`);
}
