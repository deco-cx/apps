import { AppContext } from "../mod.ts";
import { OpenAI } from "../deps.ts";

export interface Props {
  /**
   * @description the links of the site that contains images
   * @examples "https://www.instagram.com/marcoscandeia"
   */
  images: string[];
  /**
   * @description what kind of description do you want?
   * @examples you can ask for something like "What’s in this image?"\n or "Is there a car?"
   */
  prompt: string;
  choices?: number;
  maxTokens?: number;
}

export type Return = OpenAI.ChatCompletion;

export default async function (
  { images, prompt, choices = 1, maxTokens = 4096 }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Return> {
  const response = await ctx.openAI.chat.completions.create({
    n: choices,
    stream: false,
    max_tokens: maxTokens,
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...images.map((image) => ({
            type: "image_url" as const,
            image_url: { "url": image },
          })),
        ],
      },
    ],
  });

  return response;
}
