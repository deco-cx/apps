import { AssistantIds } from "../types.ts";
import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";
import { shortcircuit } from "@deco/deco";
import {
  ATTR_ASSISTANT_ID,
  ATTR_ASSISTANT_OPERATION,
  GEN_AI_SYSTEM,
  GEN_AI_SYSTEM_OPENAI,
  GEN_AI_TOKEN_TYPE,
  GEN_AI_TOKEN_TYPE_INPUT,
  GEN_AI_TOKEN_TYPE_OUTPUT,
  stats,
} from "../observability.ts";
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
    stats.tokenUsage.record(response.usage?.prompt_tokens ?? 0, {
      [GEN_AI_SYSTEM]: GEN_AI_SYSTEM_OPENAI,
      [GEN_AI_TOKEN_TYPE]: GEN_AI_TOKEN_TYPE_INPUT,
      [ATTR_ASSISTANT_ID]: assistantId,
    });
    stats.tokenUsage.record(response.usage?.completion_tokens ?? 0, {
      [GEN_AI_SYSTEM]: GEN_AI_SYSTEM_OPENAI,
      [GEN_AI_TOKEN_TYPE]: GEN_AI_TOKEN_TYPE_OUTPUT,
      [ATTR_ASSISTANT_ID]: assistantId,
    });
    return response;
  } catch (error) {
    const errorObj = error as {
      error: { message: string };
      status: number;
      headers: Headers;
    };
    stats.errors.add(1, {
      [ATTR_ASSISTANT_OPERATION]: "describe_image",
      [ATTR_ASSISTANT_ID]: assistantId,
    });
    shortcircuit(
      new Response(JSON.stringify({ error: errorObj.error.message }), {
        status: errorObj.status,
        headers: errorObj.headers,
      }),
    );
  }
}
