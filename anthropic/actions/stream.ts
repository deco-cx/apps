import { shortcircuit } from "@deco/deco";
import { readFromStream } from "@deco/deco/utils";
import { Anthropic } from "../deps.ts";
import { AppContext } from "../mod.ts";
import { getAppTools } from "../utils.ts";

export interface Props {
  /**
   * @description The system prompt to be used for the AI Assistant.
   */
  system?: string;
  /**
   * @description The mode of the AI Assistant.
   */
  mode: string;
  /**
   * @description The messages to be processed by the AI Assistant.
   */
  messages: Anthropic.MessageParam[];
  /**
   * Optional list of available functions (actions or loaders) that the AI Assistant can perform.
   */
  availableFunctions?: string[];
  /**
   * @description The model that will complete your prompt.
   */
  model?: Anthropic.Model;
  /**
   * @description The maximum number of tokens to generate.
   *
   * Different models have different maximum values for this parameter. See
   * [models](https://docs.anthropic.com/en/docs/models-overview) for details.
   */
  max_tokens?: number;
}

/**
 * @title Anthropic chat streaming
 * @description Sends messages to the Anthropic API for processing.
 */
export default async function chat(
  {
    system,
    messages,
    availableFunctions,
    model = "claude-3-5-sonnet-20240620",
    max_tokens = 1024,
  }: Props,
  _req: Request,
  ctx: AppContext,
) {
  if (!messages) {
    return shortcircuit(new Response("No messages provided", { status: 400 }));
  }

  const tools = await getAppTools(availableFunctions ?? []);

  const headers = {
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
    "x-api-key": ctx.token ?? "",
  };

  const payload: Anthropic.MessageCreateParamsStreaming = {
    system,
    messages,
    model,
    max_tokens,
    temperature: 0.5,
    stream: true,
    tools,
    tool_choice: { type: "auto" },
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("Failed to send messages to Anthropic API:", response.text);
    return shortcircuit(
      new Response(await response.text(), { status: response.status }),
    );
  }

  return readFromStream(response);
}
