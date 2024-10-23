// import { shortcircuit } from "@deco/deco";
import { callAntropic, callOpenAI } from "../../clients/llmClientObjects.ts";
import type { AppContext } from "../../mod.ts";
import type { Attachment, LLMResponseType, Prompt } from "../../types.ts";

interface Props {
  promptName?: string;
  inlinePrompt?: Prompt;
  attachments?: Attachment[];
}

export default async function action(
  {
    promptName,
    inlinePrompt,
    attachments,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LLMResponseType> {
  let prompt: Prompt | undefined;

  if (!promptName && !inlinePrompt) {
    throw new Error(`No prompt provided`);
  }
  if (promptName && inlinePrompt) {
    throw new Error(`Only provide prompt name or inline prompt, not both.`);
  }

  if (promptName) {
    prompt = ctx.content.find((p) => p.name === promptName);
    if (!prompt) {
      throw new Error(`Prompt with name: ${promptName} not found`);
    }
  } else if (inlinePrompt) {
    prompt = inlinePrompt;
  }

  // Type guard to ensure 'prompt' is defined before proceeding
  if (!prompt) {
    throw new Error("Prompt is undefined");
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
