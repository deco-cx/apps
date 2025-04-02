import type { ImagePayload, ImageResponse } from "./types.ts";

export function mapSdkToStabilityRequest(
  payload: ImagePayload,
): FormData {
  const formData = new FormData();
  const { prompt, negativePrompt, providerOptions } = payload;

  if (!prompt && !payload.image) {
    throw new Error("A prompt is required for image generation");
  }

  if (prompt) {
    formData.append("prompt", prompt);
  }

  if (negativePrompt) {
    formData.append("negative_prompt", negativePrompt);
  }

  const settings = providerOptions?.stability;
  if (settings) {
    if (settings.strength !== undefined) {
      formData.append("image_strength", settings.strength.toString());
    }
    if (settings.cfgScale !== undefined) {
      formData.append("cfg_scale", settings.cfgScale.toString());
    }
    if (settings.steps !== undefined) {
      formData.append("steps", settings.steps.toString());
    }
    if (settings.seed !== undefined) {
      formData.append("seed", settings.seed.toString());
    }
    if (settings.width !== undefined) {
      formData.append("width", settings.width.toString());
    }
    if (settings.height !== undefined) {
      formData.append("height", settings.height.toString());
    }
    if (settings.samples !== undefined) {
      formData.append("samples", settings.samples.toString());
    }
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  return formData;
}

export async function mapStabilityToSdkResponse(
  response: Response,
  type: "image" | "video" | "object3d",
): Promise<ImageResponse> {
  const result = await response.json();

  console.log({ mapperResult: result });

  if (type === "image") {
    console.log({ result2: result });
    console.log(!result.id);
    // Handle async response with id
    if (result.id) {
      return {
        id: result.id,
        status: result.status || "pending",
        warnings: result.warnings || [],
      };
    }

    // Handle sync response with image
    if (!result.id || result.result || result.image) {
      console.log("here");
      return {
        image: result.image || result.result,
        warnings: result.warnings || [],
      };
    }
  }

  throw new Error(`Unsupported response type: ${type}`);
}
