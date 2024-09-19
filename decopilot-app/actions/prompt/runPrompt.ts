import { callAntropic, callOpenAI } from "../../clients/llmClientObjects.ts";
import type { AppContext } from "../../mod.ts";
import type { Attachment, LLMResponseType } from "../../types.ts";

interface Props {
  /**
   * @format dynamic-options
   * @options decopilot-app/loaders/listAvailablePrompts.ts
   */
  name: string;
  attachments?: Attachment[];
}

export default async function action(
  { name, attachments }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LLMResponseType> {
  const prompt = ctx.content.find((p) => p.name === name);

  if (!prompt) {
    throw new Error(`Prompt with Agent Name ${name} not found`);
  }

  if (prompt.provider === "Anthropic") {
    return await callAntropic(prompt, ctx, attachments);
  }

  if (prompt.provider === "OpenAI") {
    return await callOpenAI(prompt, ctx, attachments);
  }

  throw new Error(`Provider ${prompt.provider} not found`);
}
