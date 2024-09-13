import { getAppTools } from "../../anthropic/actions/stream.ts";
import { AppContext as AnthropicAppContext } from "../../anthropic/mod.ts";
import { AppContext } from "../mod.ts";
import { Attachment, LLMResponseType, Prompt } from "../types.ts";

export const callAntropic = async (
  prompt: Prompt,
  attachments: Attachment[],
  ctx: AppContext,
): Promise<LLMResponseType> => {
  const appCtx = ctx as unknown as AnthropicAppContext;

  const funcs = getAppTools(prompt.advanced?.functions ?? []);

  const response = await appCtx.invoke("anthropic/actions/code.ts", {
    system: "decopilot",
    messages: [{
      role: "system",
      content: prompt,
    }],
    
    model: "claude-2.0",
  });
};

export const callOpenAI = async (
  prompt: Prompt,
  attachments: Attachment[],
  ctx: AppContext,
): Promise<LLMResponseType> => {
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
