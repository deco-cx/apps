import type { ImagePayload, ImageResponse } from "./types.ts";

interface StabilityOptions {
  strength?: number;
  cfgScale?: number;
  steps?: number;
  seed?: number;
  width?: number;
  height?: number;
  samples?: number;
  mask?: string;
  subject_image?: string;
  style_preset?: string;
  output_format?: string;
}

export async function mapSdkToStabilityRequest(
  payload: ImagePayload,
): Promise<FormData> {
  const formData = new FormData();
  const { prompt, negativePrompt, image, model, providerOptions } = payload;
  const stabilityOpts = (providerOptions?.stability || {}) as StabilityOptions;

  // Validate required fields based on model type
  if (model.startsWith("stability:inpaint") && !stabilityOpts.mask) {
    throw new Error("Mask is required for inpainting models");
  }

  if (
    model.startsWith("stability:search-and-replace") &&
    !stabilityOpts.subject_image
  ) {
    throw new Error("Subject image is required for search-and-replace models");
  }

  if (!prompt && !image) {
    throw new Error("Either prompt or image must be provided");
  }

  // Handle common fields
  if (prompt) {
    formData.append("prompt", prompt);
  }

  if (negativePrompt) {
    formData.append("negative_prompt", negativePrompt);
  }

  if (image) {
    const imageFile = typeof image === "string"
      ? convertBase64ToBlob(image)
      : image;
    formData.append("image", imageFile);
  }

  // Handle Stability-specific options
  if (stabilityOpts.strength) {
    formData.append("image_strength", stabilityOpts.strength.toString());
  }

  if (stabilityOpts.cfgScale) {
    formData.append("cfg_scale", stabilityOpts.cfgScale.toString());
  }

  if (stabilityOpts.steps) {
    formData.append("steps", stabilityOpts.steps.toString());
  }

  if (stabilityOpts.seed) {
    formData.append("seed", stabilityOpts.seed.toString());
  }

  if (stabilityOpts.width) {
    formData.append("width", stabilityOpts.width.toString());
  }

  if (stabilityOpts.height) {
    formData.append("height", stabilityOpts.height.toString());
  }

  if (stabilityOpts.samples) {
    formData.append("samples", stabilityOpts.samples.toString());
  }

  if (stabilityOpts.mask) {
    const maskFile = await convertBase64ToBlob(stabilityOpts.mask);
    formData.append("mask", maskFile);
  }

  if (stabilityOpts.subject_image) {
    const subjectImageFile = await convertBase64ToBlob(
      stabilityOpts.subject_image,
    );
    formData.append("subject_image", subjectImageFile);
  }

  if (stabilityOpts.style_preset) {
    formData.append("style_preset", stabilityOpts.style_preset);
  }

  if (stabilityOpts.output_format) {
    formData.append("output_format", stabilityOpts.output_format);
  }

  return formData;
}

function convertBase64ToBlob(base64: string): Blob {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: "image/png" });
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
