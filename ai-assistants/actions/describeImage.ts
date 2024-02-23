import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";
import { logger } from "deco/observability/otel/config.ts";
import { meter } from "deco/observability/otel/metrics.ts";
import { AssistantIds } from "../types.ts";
import { ValueType } from "deco/deps.ts";

const stats = {
  promptTokens: meter.createHistogram("assistant_image_prompt_tokens", {
    description: "Tokens used in Sales Assistant Describe Image Input - OpenAI",
    valueType: ValueType.INT,
  }),
  completionTokens: meter.createHistogram("assistant_image_completion_tokens", {
    description:
      "Tokens used in Sales Assistant Describe Image Output - OpenAI",
    valueType: ValueType.INT,
  }),
};
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") || "" });

export interface DescribeImageProps {
  uploadURL: string;
  userPrompt: string;
  assistantIds?: AssistantIds;
}

export default async function describeImage(
  describeImageProps: DescribeImageProps,
) {
  logger.info(`${
    JSON.stringify({
      assistantId: describeImageProps.assistantIds?.assistantId,
      threadId: describeImageProps.assistantIds?.threadId,
      context: "describeImage",
      subcontext: "props",
      props: describeImageProps,
    })
  }`);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Describe this image in few words focus on it's main characteristics. Use the same language as the user prompt.
                            This description will be used to search similar items in an e-commerce store,
                            so describe name of the product and other relevant information. Use NO MORE than 3 words to describe the product.
                             Avoid using colors. Also, take into consideration the user prompt and describe the object it
                             focuses on if there is one. Output should be 1-2 sentences and should be a request summarizing
                             the user's need/request to a sales assistant that will search the product in an e-commerce store.

                             User prompt:
                            ${describeImageProps.userPrompt}`,
            },
            {
              type: "image_url",
              image_url: {
                "url": describeImageProps.uploadURL,
              },
            },
          ],
        },
      ],
    });

    logger.info({
      assistantId: describeImageProps.assistantIds?.assistantId,
      threadId: describeImageProps.assistantIds?.threadId,
      context: "describeImage",
      subcontext: "response",
      response: JSON.stringify(response),
    });
    stats.promptTokens.record(response.usage?.prompt_tokens ?? 0, {
      assistant_id: describeImageProps.assistantIds?.assistantId,
    });
    stats.completionTokens.record(response.usage?.completion_tokens ?? 0, {
      assistant_id: describeImageProps.assistantIds?.assistantId,
    });
    return response;
  } catch (error) {
    logger.error(`${
      JSON.stringify({
        assistantId: describeImageProps.assistantIds?.assistantId,
        threadId: describeImageProps.assistantIds?.threadId,
        context: "describeImage",
        error: JSON.stringify(error),
      })
    }`);
    return new Response(JSON.stringify({ error: error.error.message }), {
      status: error.status,
      headers: error.headers,
    });
  }
}
