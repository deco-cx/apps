import { type StabilityImageModelId } from "../settings.ts";
import { type ImagePayload, type ImageResponse } from "../types.ts";
import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { ExtendedImageModel } from "../image-provider.ts";

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

async function pollForResult(
  imageModel: ExtendedImageModel,
  id: string,
  maxAttempts = 30,
  delayMs = 1000,
): Promise<ImageResponse> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await imageModel.getImage(id);

    if ("image" in result) {
      return result;
    }

    if (result.status === "failed") {
      throw new Error("Image generation failed");
    }

    if (result.status === "succeeded") {
      // If status is succeeded but no image, try one more time
      const finalResult = await imageModel.getImage(id);
      if ("image" in finalResult) {
        return finalResult;
      }
      throw new Error("Image generation completed but no image was returned");
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Timeout waiting for image generation");
}

export default async function upscaleFast(
  { imageUrl, presignedUrl }: UpscaleFastProps,
  _request: Request,
  ctx: AppContext,
) {
  try {
    // Fetch the image from URL
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

    // Prepare the payload
    const payload: ImagePayload = {
      model: "stability:fast",
      image: imageBlob,
      providerOptions: {
        stability: {
          strength: 0.75,
        },
      },
    };

    // Generate the upscaled image
    const result = await imageModel.doGenerate(payload);

    // Handle both sync and async responses
    if ("id" in result) {
      // Async response - poll for the result
      const finalResult = await pollForResult(imageModel, result.id);
      if ("image" in finalResult) {
        // Upload the result
        const url = await uploadImage(finalResult.image, presignedUrl);

        // Return the result with a suggestion for further enhancement
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
