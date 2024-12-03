import { AssistantIds } from "../types.ts";
import { AppContext } from "../mod.ts";
import { logger, meter, ValueType } from "@deco/deco/o11y";
import { shortcircuit } from "@deco/deco";

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
  describeImageError: meter.createCounter("assistant_describe_image_error", {
    unit: "1",
    valueType: ValueType.INT,
  }),
};
export interface DescribeImageProps {
  uploadURL: string;
  userPrompt: string;
  assistantIds?: AssistantIds;
}
// TODO(ItamarRocha): Rate limit
// TODO(@ItamarRocha): Refactor to use https://github.com/deco-cx/apps/blob/main/openai/loaders/vision.ts
export default async function describeImage(
  describeImageProps: DescribeImageProps,
  _req: Request,
  ctx: AppContext,
) {
  const assistantId = describeImageProps.assistantIds?.assistantId;
  const threadId = describeImageProps.assistantIds?.threadId;
  try {
    const response = await ctx.openAI.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Describe this image in few words focus on it's main characteristics.
                            This description will be used to search similar items in an e-commerce store,
                            so describe name of the product and other relevant information. Use NO MORE than 3 words to describe the product.
                             Avoid using colors. Also, take into consideration the user prompt and describe the object it
                             focuses on if there is one. Output should be 1-2 sentences and should be a request summarizing
                             the user's need/request to a sales assistant that will search the product in an e-commerce store.

                             * Use the same language as the user prompt in your answer *

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
      assistantId: assistantId,
      threadId: threadId,
      context: "describeImage",
      response: JSON.stringify(response),
      props: describeImageProps,
    });
    stats.promptTokens.record(response.usage?.prompt_tokens ?? 0, {
      assistant_id: assistantId,
    });
    stats.completionTokens.record(response.usage?.completion_tokens ?? 0, {
      assistant_id: assistantId,
    });
    return response;
  } catch (error) {
    const errorObj = error as {
      error: { message: string };
      status: number;
      headers: Headers;
    };
    stats.describeImageError.add(1, {
      assistantId,
    });
    shortcircuit(
      new Response(JSON.stringify({ error: errorObj.error.message }), {
        status: errorObj.status,
        headers: errorObj.headers,
      }),
    );
  }
}
