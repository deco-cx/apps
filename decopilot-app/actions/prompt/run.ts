import {
  callAntropic,
  callOpenAI
} from "../../clients/llmClientObjects.ts";
import type { AppContext } from "../../mod.ts";
import type { Attachment, LLMResponseType } from "../../types.ts";

interface Props {
  name: string;
  attachments: Attachment[];
}

export default async function action(
  { name, attachments }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LLMResponseType> {
  const prompt = ctx.content.find((p) => p.name === name);

  if (!prompt) {
    throw new Error(`Prompt with agentName ${name} not found`);
  }

  if (prompt.provider === "Anthropic") {
    return await callAntropic(prompt, attachments, ctx);
  }

  if (prompt.provider === "Openai") {
    return await callOpenAI(prompt, attachments, ctx);
  }

  throw new Error(`Provider ${prompt.provider} not found`);
}
