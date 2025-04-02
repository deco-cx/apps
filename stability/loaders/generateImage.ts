import { AppContext } from "../mod.ts";
import { Buffer } from "node:buffer";

/**
 * @name GENERATE_IMAGE
 * @description Generates an image from a text prompt using the Stability API. A presigned URL to upload the image to is required.
 */
export interface Props {
  /**
   * @description The presigned URL to upload the image to after generation.
   */
  presignedUrl: string;
  /**
   * @description The text prompt to generate the image from
   */
  prompt: string;
  /**
   * @description The negative prompt to avoid certain elements in the image
   */
  negativePrompt?: string;
  /**
   * @description The width of the generated image
   * @default 1024
   */
  width?: number;
  /**
   * @description The height of the generated image
   * @default 1024
   */
  height?: number;
  /**
   * @description The number of steps for image generation
   * @default 30
   */
  steps?: number;
  /**
   * @description The CFG scale for image generation
   * @default 7
   */
  cfgScale?: number;
  /**
   * @description The seed for deterministic generation
   */
  seed?: number;
  /**
   * @description The model to use for generation
   * @default core
   */
  model?: "core" | "ultra";
}

export default async function generateImage(
  {
    presignedUrl,
    prompt,
    negativePrompt = "",
    width = 1024,
    height = 1024,
    steps = 30,
    cfgScale = 7,
    seed,
    model = "core",
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { stabilityClient } = ctx;
  const imageModel = stabilityClient(model, {
    width,
    height,
    steps,
    cfgScale,
    seed,
  });

  try {
    const result = await imageModel.doGenerate({
      prompt,
      providerOptions: {
        stability: {
          negativePrompt,
        },
      },
    });

    const url = await uploadImage(result.image, presignedUrl);

    return {
      content: [
        {
          type: "text",
          text: `Uploaded image to ${url}`,
        },
      ],
    };
  } catch (error) {
    console.error(error);
  }
}

export async function uploadImage(image: string, presignedUrl: string) {
  const imageBuffer = Buffer.from(image, "base64");

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: imageBuffer,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data: {
    url: string;
  } = await response.json();

  console.log({ data });

  return data.url;
}
