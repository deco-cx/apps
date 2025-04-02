import { type StabilityImageModelId } from "../settings.ts";
import { type ImagePayload, type ImageResponse } from "../types.ts";
import { AppContext } from "../mod.ts";
import { uploadImage } from "./generateImage.ts";
import { ExtendedImageModel } from "../image-provider.ts";
/**
 * @name UPSCALE_CREATIVE
 * @description High-quality tool to enhance image resolution by 4x with creative interpretation.
 * This tool works best on highly degraded images and performs heavy reimagining.
 */
export interface UpscaleCreativeProps {
  imageUrl: string;
  presignedUrl: string;
  prompt: string;
  negativePrompt?: string;
  creativity?: number;
}

export const upscaleCreativeToolDefinition = {
  name: "stability-ai-upscale-creative",
  description:
    `High-quality tool to enhance image resolution by 4x with creative interpretation. This tool works best on highly degraded images and performs heavy reimagining.`,
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
      prompt: {
        type: "string",
        description:
          "What you wish to see in the output image. A strong, descriptive prompt that clearly defines elements, colors, and subjects.",
      },
      negativePrompt: {
        type: "string",
        description:
          "Optional text describing what you do not wish to see in the output image.",
      },
      creativity: {
        type: "number",
        description:
          "Optional value (0-0.35) indicating how creative the model should be. Higher values add more details during upscaling.",
      },
    },
    required: ["imageUrl", "presignedUrl", "prompt"],
  },
};

async function pollForResult(
  imageModel: ExtendedImageModel,
  id: string,
  maxAttempts = 120,
  delayMs = 1000,
): Promise<ImageResponse> {
  const startTime = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes timeout

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Check if we've exceeded the timeout
    if (Date.now() - startTime > timeout) {
      throw new Error("Timeout waiting for image generation (5 minutes)");
    }

    const result = await imageModel.getImage(id);

    if ("image" in result || "result" in result || !result.id) {
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

  throw new Error(
    `Timeout waiting for image generation after ${maxAttempts} attempts`,
  );
}

export default function upscaleCreativeTool(
  { imageUrl, presignedUrl, prompt, negativePrompt, creativity }:
    UpscaleCreativeProps,
  _request: Request,
  ctx: AppContext,
) {
  try {
    const finalUrl = presignedUrl.replaceAll("_presigned_url", "");
    handleUpscaleCreative({
      imageUrl,
      presignedUrl,
      prompt,
      negativePrompt,
      creativity,
      ctx,
    });
    return {
      content: [
        {
          type: "text",
          text: `The upscaled image is available at ${finalUrl}`,
        },
      ],
    };
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

async function handleUpscaleCreative({
  imageUrl,
  presignedUrl,
  prompt,
  negativePrompt,
  creativity,
  ctx,
}: UpscaleCreativeProps & { ctx: AppContext }) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    const { stabilityClient } = ctx;
    const imageModel = stabilityClient("creative" as StabilityImageModelId, {
      steps: 30,
      cfgScale: 7,
    });

    const payload: ImagePayload = {
      model: "stability:creative",
      prompt,
      negativePrompt,
      image: imageBlob,
      providerOptions: {
        stability: {
          strength: 0.75,
          cfgScale: creativity ? 7 + (creativity * 10) : 7, // Adjust cfgScale based on creativity
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
              text:
                `Successfully upscaled image with creative enhancement and uploaded to ${url}`,
            },
          ],
        };
      }
      throw new Error("Failed to get image result");
    } else {
      const url = await uploadImage(result.image, presignedUrl);

      return {
        content: [
          {
            type: "text",
            text:
              `Successfully upscaled image with creative enhancement and uploaded to ${url}`,
          },
        ],
      };
    }
  } catch (error) {
    console.error(error);
  }
}
