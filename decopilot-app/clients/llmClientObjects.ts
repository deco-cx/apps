// import  getAppTools from "../../openai/actions/code.ts";
import { AppContext as AnthropicAppContext } from "../../anthropic/mod.ts";
import { allowedModels } from "../../anthropic/actions/code.ts";

import { AppContext } from "../mod.ts";
import { Attachment, LLMResponseType, Prompt } from "../types.ts";
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
  let message_text: string;
  const final_message: string[] = [];
  // let Clientresponse : any
  const tools_used: string[] = [];

  if (prompt.advanced || attachments) {
    callMessage = await assembleFinalPrompt(prompt, attachments);
  }

  const Clientresponse = await appCtx.invoke("anthropic/actions/invoke.ts", {
    messages: [
      { role: "user", content: callMessage },
    ],
    availableFunctions: prompt.advanced?.availableFunctions,
    tool_choice: { type: "any" },
    model: modelToUse,
    max_tokens: 4096,
    temperature: 0.0,
  });
  console.log(Clientresponse);

  for (const block of Clientresponse.content) {
    if (block.type == "text") {
      message_text = block.text;
      final_message.push(message_text);
    } else if (block.type == "tool_use") {
      const key = block.name.replace(/__/g, "/") + ".ts";
      message_text = `used tool:\n ${key}\n inputs:\n ${
        JSON.stringify(block.input)
      }`; //change this to be able to actually use this
      tools_used.push(block.name);
      final_message.push(message_text);
    }
  }

  const response: LLMResponseType = {
    id: Clientresponse.id,
    created: 0,
    provider: "Anthropic", // Provider is Anthropic
    model: modelToUse,
    tools: tools_used,
    llm_response: [{
      message: {
        role: Clientresponse.role ?? "unknown", // Adjust based on actual response structure
        content: final_message.join("\n") ?? "", // Adjust based on actual response structure
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
    id: "None",
    created: 0,
    provider: "OpenAI", // Provider is OpenAI
    model: prompt.model,
    tools: [""],
    llm_response: [{
      message: {
        role: "Not Ready",
        content: `OpenAI functions still not ready`,
      },
      index: 0,
    }],
  };
  return response;
};

export type Caller = (
  prompt: Prompt,
  attachments: Attachment[],
  ctx: AppContext,
) => Promise<LLMResponseType>;
