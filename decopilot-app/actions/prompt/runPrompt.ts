// import { shortcircuit } from "@deco/deco";
import { callAntropic, callOpenAI } from "../../clients/llmClientObjects.ts";
import type { AppContext } from "../../mod.ts";
import type { Attachment, LLMResponseType, Prompt } from "../../types.ts";

interface Props {
  /**
   * @format dynamic-options
   * @options decopilot-app/loaders/listAvailablePrompts.ts
   */
  called_prompt: string | Prompt;
  attachments?: Attachment[];
}

export default async function action(
  { called_prompt, attachments }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LLMResponseType> {
  let prompt: Prompt | undefined;

  if (!isPrompt(called_prompt)) {
    prompt = ctx.content.find((p) => p.name === called_prompt);
  } else {
    prompt = called_prompt;
  }

  if (!prompt) {
    const promptName = typeof called_prompt === "string"
      ? called_prompt
      : called_prompt.name;
    throw new Error(`Prompt with Name: ${promptName} not found`);
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

function isPrompt(called_prompt: string | Prompt): called_prompt is Prompt {
  return typeof called_prompt !== "string";
}
