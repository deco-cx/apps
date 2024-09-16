// import  getAppTools from "../../anthropic/actions/code.ts";
// import  getAppTools from "../../openai/actions/code.ts";
import { AppContext as AnthropicAppContext } from "../../anthropic/mod.ts";
import { allowedModels } from "../../anthropic/actions/code.ts";

import { AppContext } from "../mod.ts";
import { Attachment, LLMResponseType, Prompt } from "../types.ts";

export const callAntropic = async (
  prompt: Prompt,
  ctx: AppContext,
  _attachments?: Attachment[],
): Promise<LLMResponseType> => {
  const appCtx = ctx as unknown as AnthropicAppContext;

  // deno-lint-ignore no-explicit-any
  const modelToUse = allowedModels.includes(prompt.model as any)
    ? (prompt.model as typeof allowedModels[number])
    : "claude-3-opus-20240229"; // fallback to a default model if not valid

  // const funcs = getAppTools(prompt.advanced?.functions ?? []);
  const Clientresponse = await appCtx.invoke("anthropic/actions/code.ts", {
    messages: [
      { role: "user", content: prompt.prompt },
    ],
    model: modelToUse,
    max_tokens: 4096,
  });

  const contentString = Clientresponse.content
    .map((block) => block.text) // Extract the text from each block
    .join(" "); // Join them into a single string with a space between blocks

  const response: LLMResponseType = {
    id: Clientresponse.id,
    created: 0,
    provider: "Anthropic", // Provider is OpenAI
    model: "chatGPT",
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

export type Caller = (
  prompt: Prompt,
  attachments: Attachment[],
  ctx: AppContext,
) => Promise<LLMResponseType>;

// export class AnthropicClient implements LLMClient {
//   // private client: LLMClient;
//   public provider: Provider;

//   constructor(provider: Provider) {
//     // this.client = client;
//     this.provider = provider;
//   }

//   // const providerName = "Anthropic"
//   call(prompt: string, ctx: AppContext): LLMResponseType {
//     ctx.invoke("decopilot");
//     console.log(`Calling Anthropic with prompt: ${prompt}`);
//     const response: LLMResponseType = {
//       id: "lol",
//       created: 0,
//       provider: this.provider, // Provider is OpenAI
//       model: "Claude",
//       llm_response: [{
//         message: {
//           role: "lol",
//           content: `Pedro didn't write this yet, the prompt was ${prompt}`,
//         },
//         index: 0,
//       }],
//     };
//     return response;
//     // logica pra chamar a anthropic
//   }
// }

// export class OpenAIClient implements LLMClient {
//   public provider: Provider;

//   constructor(provider: Provider, client: App) {
//     // this.client = client;
//     this.provider = provider;
//   }

//   call(prompt: string, agent: Prompt): LLMResponseType {
//     console.log(`Calling OpenAI with prompt: ${prompt}`);
//     const response: LLMResponseType = {
//       id: "lol",
//       created: 0,
//       provider: "Anthropic", // Provider is OpenAI
//       model: "chatGPT",
//       llm_response: [{
//         message: {
//           role: "lol",
//           content: `Pedro didn't write this yet, the prompt was ${prompt}`,
//         },
//         index: 0,
//       }],
//     };
//     return response;
//     // logica pra chamar a openai
//   }
// }
