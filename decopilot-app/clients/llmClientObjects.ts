// import  getAppTools from "../../anthropic/actions/code.ts";
// import  getAppTools from "../../openai/actions/code.ts";
import { AppContext as AnthropicAppContext } from "../../anthropic/mod.ts";
import { allowedModels } from "../../anthropic/actions/code.ts";

import { AppContext } from "../mod.ts";
import { Attachment, LLMResponseType, Prompt } from "../types.ts";
// import { handleAnthropicAttachments } from "../utils/handleAttachments.ts";
// import { propsLoader } from "deco/blocks/propsLoader.ts";
import assembleFinalPrompt from "../utils/assembleComplexPrompt.ts";

export const callAntropic = async (
  prompt: Prompt,
  ctx: AppContext,
  attachments?: Attachment[],
): Promise<LLMResponseType> => {
  const appCtx = ctx as unknown as AnthropicAppContext;

  // deno-lint-ignore no-explicit-any
  const modelToUse = allowedModels.includes(prompt.model as any)
    ? (prompt.model as typeof allowedModels[number])
    : "claude-3-opus-20240229"; // fallback to a default model if not valid

  let callMessage = prompt.prompt;

  if (prompt.advanced || attachments) {
    callMessage = await assembleFinalPrompt(prompt, attachments);
  }
  console.log(callMessage);
  const Clientresponse = await appCtx.invoke("anthropic/actions/code.ts", {
    messages: [
      { role: "user", content: callMessage },
    ],
    model: modelToUse,
    max_tokens: 4096,
    temperature: 0.0,
  });

  const contentString = Clientresponse.content
    .map((block) => block.text) // Extract the text from each block
    .join(" "); // Join them into a single string with a space between blocks

  const response: LLMResponseType = {
    id: Clientresponse.id,
    created: 0,
    provider: "Anthropic", // Provider is Anthropic
    model: modelToUse,
    llm_response: [{
      message: {
        role: Clientresponse.role ?? "unknown", // Adjust based on actual response structure
        content: contentString ?? "", // Adjust based on actual response structure
      },
      index: 0,
    }],
  };
  return response;
  // logica pra chamar a openai
};

export const callOpenAI = (
  prompt: Prompt,
  _ctx: AppContext,
  _attachments?: Attachment[],
): LLMResponseType => {
  const response: LLMResponseType = {
    id: "lol",
    created: 0,
    provider: "OpenAI", // Provider is OpenAI
    model: prompt.model,
    llm_response: [{
      message: {
        role: "lol",
        content: `Pedro didn't write this yet, the prompt was ${prompt.prompt}`,
      },
      index: 0,
    }],
  };
  return response;
  // logica pra chamar a openai
};

// export const allCustomProvider = ():=>{}

export type Caller = (
  prompt: Prompt,
  attachments: Attachment[],
  ctx: AppContext,
) => Promise<LLMResponseType>;
