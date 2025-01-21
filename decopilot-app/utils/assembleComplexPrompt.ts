import { Attachment, Prompt, PromptDetails } from "../types.ts";
import { handleAttachments } from "./handleAttachments.ts";

export function assemblePrompt(
  mainPrompt: string,
  advanced?: PromptDetails,
  handledAttachments?: string | null,
): string {
  let finalPrompt = mainPrompt;

  if (advanced) {
    const { context, examples, restrictions } = advanced;

    if (context) {
      finalPrompt += `\n\nContext:\n${context}`;
    }

    if (examples) {
      finalPrompt += `\n\nExamples:\n${examples}`;
    }

    if (handledAttachments) {
      finalPrompt += handledAttachments;
    }

    if (restrictions) {
      finalPrompt += `\n\nRestrictions:\n${restrictions}`;
    }
  } else if (handledAttachments) {
    finalPrompt += handledAttachments;
  }

  return finalPrompt;
}

export default async function assembleFinalPrompt(
  prompt: Prompt,
  attachments?: Attachment[],
): Promise<string> {
  const { prompt: mainPrompt, advanced } = prompt;

  const finalPrompt = assemblePrompt(
    mainPrompt,
    advanced,
    attachments ? await handleAttachments(attachments) : "",
  );

  return finalPrompt;
}
