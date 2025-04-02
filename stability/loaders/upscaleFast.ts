import { type StabilityImageModelId } from "../settings.ts";
import { type ImagePayload } from "../types.ts";
import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { pollForResult } from "./upscaleCreative.ts";

/**
 * @name UPSCALE_FAST
 * @description Cheap and fast tool to enhance image resolution by 4x.
 */
export interface UpscaleFastProps {
  imageUrl: string;
  presignedUrl: string;
}

export const upscaleFastToolDefinition = {
  name: "stability-ai-upscale-fast",
  description: `Cheap and fast tool to enhance image resolution by 4x.`,
  inputSchema: {
    type: "object",
    properties: {
      imageUrl: {
        type: "string",
        description: `The URL to the image file to upscale`,
      },
      presignedUrl: {
        type: "string",
        description: "The presigned URL to upload the upscaled image to",
      },
    },
    required: ["imageUrl", "presignedUrl"],
  },
};

export default async function upscaleFast(
  { imageUrl, presignedUrl }: UpscaleFastProps,
  _request: Request,
  ctx: AppContext,
) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    const { stabilityClient } = ctx;
    const imageModel = stabilityClient("fast" as StabilityImageModelId, {
      steps: 20,
      cfgScale: 7,
    });

    const payload: ImagePayload = {
      model: "stability:fast",
      image: imageBlob,
      providerOptions: {
        stability: {
          strength: 0.75,
        },
      },
    };

    const result = await imageModel.doGenerate(payload);

    if ("id" in result) {
      const finalResult = await pollForResult(imageModel, result.id);
      if ("image" in finalResult) {
        const url = await uploadImage(finalResult.image, presignedUrl);

        return {
          content: [
            {
              type: "text",
              text: `Successfully upscaled image and uploaded to ${url}`,
            },
            {
              type: "text",
              text:
                `If you need even higher quality, you can use the upscale-creative model which provides better results but takes longer to process.`,
            },
          ],
        };
      }
      throw new Error("Failed to get image result");
    } else if ("image" in result) {
      // Sync response - we can use it directly
      const url = await uploadImage(result.image, presignedUrl);

      return {
        content: [
          {
            type: "text",
            text: `Successfully upscaled image and uploaded to ${url}`,
          },
          {
            type: "text",
            text:
              `If you need even higher quality, you can use the upscale-creative model which provides better results but takes longer to process.`,
          },
        ],
      };
    }

    throw new Error("Invalid response from Stability API");
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Error: Failed to upscale image: ${errorMessage}`,
        },
      ],
    };
  }
}
