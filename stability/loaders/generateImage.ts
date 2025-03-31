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
  console.log({ prompt, negativePrompt });
  const { stabilityClient } = ctx;
  const imageModel = stabilityClient(model, {
    width,
    height,
    steps,
    cfgScale,
    seed,
  });

  console.log({ imageModel });

  try {
    const result = await imageModel.doGenerate({
      prompt,
      providerOptions: {
        stability: {
          negativePrompt: negativePrompt ? negativePrompt : undefined,
        },
      },
    });

    await uploadImage(result.images[0], presignedUrl);

    return {
      content: [
        {
          type: "text",
          text: "Image successfully generated and uploaded",
        },
      ],
    };
  } catch (error) {
    console.error(error);
  }
}

async function uploadImage(image: string, presignedUrl: string) {
  const imageBuffer = Buffer.from(image, "base64");

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: imageBuffer,
  });

  console.log({ response });
}
