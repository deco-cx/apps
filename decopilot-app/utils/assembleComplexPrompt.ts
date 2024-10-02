import { Attachment, Prompt, PromptDetails } from "../types.ts";
import { handleAnthropicAttachments } from "./handleAttachments.ts";

export function assembleOpenAIPrompt(
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

export function assembleAnthropicPrompt(
  mainPrompt: string,
  advanced?: PromptDetails,
  handledAttachments?: string | null,
): string {
  let finalPrompt = mainPrompt;

  if (advanced) {
    const { context, examples, restrictions } = advanced;

    if (context) {
      finalPrompt += `\n\n<Context>\n${context}\n</Context>`;
    }

    if (examples) {
      finalPrompt += `\n\n<Examples>\n${examples}\n</Examples>`;
    }

    if (handledAttachments) {
      finalPrompt += handledAttachments;
    }

    if (restrictions) {
      finalPrompt += `\n\n<Restrictions>\n${restrictions}\n</Restrictions>`;
    }
  } else if (handledAttachments) {
    finalPrompt += handledAttachments;
  }

  return finalPrompt;
}

function assembleFallbackPrompt(
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
  const { provider, prompt: mainPrompt, advanced } = prompt;

  let finalPrompt = "";
  let handledAttachments = "";

  if (attachments) {
    handledAttachments = await handleAnthropicAttachments(attachments);
  }

  switch (provider) {
    case "OpenAI":
      finalPrompt = assembleOpenAIPrompt(
        mainPrompt,
        advanced,
        handledAttachments,
      );
      break;

    case "Anthropic":
      finalPrompt = assembleAnthropicPrompt(
        mainPrompt,
        advanced,
        handledAttachments,
      );
      break;

    default:
      finalPrompt = assembleFallbackPrompt(
        mainPrompt,
        advanced,
        handledAttachments,
      );
      break;
  }

  return finalPrompt;
}
