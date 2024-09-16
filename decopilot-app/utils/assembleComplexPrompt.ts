// import { String } from "https://esm.sh/v135/aws-sdk@2.1585.0/clients/batch.js";
import { Attachment, Prompt, PromptDetails } from "../types.ts";

function assembleOpenAIPrompt(
  mainPrompt: string,
  advanced?: PromptDetails,
): string {
  let finalPrompt = `OpenAI Request:\n${mainPrompt}`;

  if (advanced) {
    const { context, examples, restrictions } = advanced;

    if (context) {
      finalPrompt += `\n\nContext:\n${context}`;
    }

    if (examples) {
      finalPrompt += `\n\nExamples:\n${examples}`;
    }

    if (restrictions) {
      finalPrompt += `\n\nRestrictions:\n${restrictions}`;
    }
  }

  return finalPrompt;
}

function assembleAnthropicPrompt(
  mainPrompt: string,
  advanced?: PromptDetails,
): string {
  let finalPrompt = `Anthropic Request:\nHuman: ${mainPrompt}\nAI:`;

  if (advanced) {
    const { context, examples, restrictions } = advanced;

    if (context) {
      finalPrompt += `\n\nContext:\n${context}`;
    }

    if (examples) {
      finalPrompt += `\n\nExamples:\n${examples}`;
    }

    if (restrictions) {
      finalPrompt += `\n\nRestrictions:\n${restrictions}`;
    }
  }

  return finalPrompt;
}

function assembleFallbackPrompt(
  mainPrompt: string,
  advanced?: PromptDetails,
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

    if (restrictions) {
      finalPrompt += `\n\nRestrictions:\n${restrictions}`;
    }
  }

  return finalPrompt;
}

export default function assembleFinalPrompt(
  prompt: Prompt,
  _attachments: Attachment[],
): string {
  const { provider, prompt: mainPrompt, advanced } = prompt;

  let finalPrompt = "";

  switch (provider) {
    case "OpenAI":
      finalPrompt = assembleOpenAIPrompt(mainPrompt, advanced);
      break;

    case "Anthropic":
      finalPrompt = assembleAnthropicPrompt(mainPrompt, advanced);
      break;

    default:
      finalPrompt = assembleFallbackPrompt(mainPrompt, advanced);
      break;
  }

  return finalPrompt;
}
