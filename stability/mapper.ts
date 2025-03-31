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
    formData.append("init_image", payload.image);
  }

  return formData;
}

export async function mapStabilityToSdkResponse(
  response: Response,
  type: "image" | "video" | "object3d",
): Promise<ImageResponse> {
  const result = await response.json();

  console.log({ result });

  if (type === "image") {
    return {
      images: [result.image],
      warnings: [],
    };
  }

  throw new Error(`Unsupported response type: ${type}`);
}
