import type { AppContext } from "../../mod.ts";

import type {
  Attachment,
  LLMChainResponseType,
  LLMResponseType,
  Provider,
  TextOnly,
} from "../../types.ts";

// import { LLMAgent } from "../../types.ts";
import runPrompt from "../prompt/runPrompt.ts";
import getSavedPrompts from "../../loaders/getSavedPrompts.ts";

interface Props {
  /**
   * @format dynamic-options
   * @options decopilot-app/loaders/listAvailableChains.ts
   */
  name: string;
  attachments?: Attachment[];
}

export default async function action(
  { name, attachments }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LLMChainResponseType> {
  const chain = ctx.chains.find((p) => p.name === name);

  if (!chain) {
    throw new Error(`Chain with name: ${name} not found`);
  }

  let runResponse: LLMResponseType | null = null;

  const providerArray: Provider[] = [];
  const modelArray: string[] = [];

  let runAttachments = attachments; // Initial attachments from Props
  console.log(runAttachments);

  // Check the ChainType first
  if (chain.chainType === "Simple") {
    // Process Simple chain (only Prompts)
    for (const block of chain.blockNames) {
      if (block.blockType === "Prompt") {
        // const selected_prompt: Prompt | null
        const selected_prompt = getSavedPrompts(
          { name: block.blockNames },
          _req,
          ctx,
        );

        if (!selected_prompt) {
          throw new Error(
            `Prompt with Agent Name ${block.blockNames} not found`,
          );
        }

        // const promptData = {
        //   name: selected_prompt.name, // Assuming the Prompt has an agentName property
        //   // prompt: selected_prompt.prompt,
        //   runAttachments
        // };

        // Call runPrompt and use the output as the next attachment
        const response = await runPrompt(
          { promptName: selected_prompt.name, attachments },
          _req,
          ctx,
        );

        console.log(response);

        providerArray.push(response.provider);
        modelArray.push(response.model);

        const response_message = response.llm_response.map(
          (resp) => resp?.message?.content,
        ).filter(
          (content) => content !== null,
        ) as string[];

        runAttachments = [
          reassembleAttachmentToText(response_message.join("\n")),
        ];
        console.log(runAttachments);
        // Store the last response content
        runResponse = response;
      }
    }
  } else if (chain.chainType === "Complex") {
    // Process Complex chain (may include LLMAgents)
    // (Implement Complex chain handling here)
  }

  if (!runResponse) {
    throw new Error(
      "No valid response was received during the chain execution.",
    );
  }

  const response: LLMChainResponseType = {
    id: "chain_response_id", // Replace with an actual ID
    created: Date.now(),
    provider: providerArray, // Example provider
    model: modelArray, // Example model
    llm_response: runResponse.llm_response,
  };

  return response;
}

// Helper functions to identify the content type
function reassembleAttachmentToText(message: string): TextOnly {
  // Simply reassemble the message into the expected TextOnly format
  return {
    type: "TextOnly",
    call_text: message,
  };
}
