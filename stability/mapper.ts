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
    if (typeof settings.strength === "number") {
      formData.append("image_strength", settings.strength.toString());
    }
    if (typeof settings.cfgScale === "number") {
      formData.append("cfg_scale", settings.cfgScale.toString());
    }
    if (typeof settings.steps === "number") {
      formData.append("steps", settings.steps.toString());
    }
    if (typeof settings.seed === "number") {
      formData.append("seed", settings.seed.toString());
    }
    if (typeof settings.width === "number") {
      formData.append("width", settings.width.toString());
    }
    if (typeof settings.height === "number") {
      formData.append("height", settings.height.toString());
    }
    if (typeof settings.samples === "number") {
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

  if (type === "image") {
    if (result.id) {
      return {
        id: result.id,
        status: result.status || "pending",
        warnings: result.warnings || [],
      };
    }

    if (!result.id || result.result || result.image) {
      return {
        image: result.image || result.result,
        warnings: result.warnings || [],
      };
    }
  }

  throw new Error(`Unsupported response type: ${type}`);
}
