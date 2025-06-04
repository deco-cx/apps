import { AppContext } from "../mod.ts";
import { FluxImageGenerationRequest, FluxResultResponse } from "../types.ts";

/**
 * @title Generate Image with FLUX
 * @description Creates high-quality images from text prompts using FLUX.1 Kontext Pro model.
 * This action allows you to generate images by providing a descriptive prompt and customizing
 * various parameters to control the output quality and format.
 */
export interface Props {
  /**
   * @description The presigned URLs to upload the generated images to. If provided, the image will be
   * uploaded to these URLs rather than returned as a URL in the response. The generation will be
   * asynchronous and you'll get a success message immediately.
   *
   * Can be obtained from a CREATE_PRESIGNED_URL tool or similar functionality that creates S3/cloud storage
   * presigned URLs with PUT permission.
   */
  presignedUrls?: string[];

  /**
   * @description The text prompt that describes the image you want to generate. For best results,
   * be specific and detailed about what you want to see in the image. Include details about style,
   * setting, lighting, composition, and other visual elements.
   *
   * @example "A photorealistic image of a futuristic city with flying cars, tall glass buildings,
   * and a sunset in the background, 8k resolution, detailed lighting"
   */
  prompt: string;

  /**
   * @description Desired aspect ratio for the generated image. All outputs are approximately 1MP total.
   * Supports ratios from 3:7 (portrait) to 7:3 (landscape).
   *
   * Examples:
   * - "1:1" - Square (1024x1024)
   * - "16:9" - Landscape
   * - "9:16" - Portrait
   * - "4:3" - Traditional photo
   * - "3:2" - Classic photography
   *
   * @default "1:1"
   */
  aspect_ratio?: string;

  /**
   * @description Seed for reproducibility. Use the same seed with the same prompt to get
   * consistent results. If null or omitted, a random seed is used.
   *
   * @example 42
   */
  seed?: number | null;

  /**
   * @description Whether to perform upsampling on the prompt. This can improve the quality
   * and detail of the generated image. Currently advised for text-to-image generation only.
   *
   * @default false
   */
  prompt_upsampling?: boolean;

  /**
   * @description Moderation level for inputs and outputs. Controls how strictly content is filtered.
   *
   * - 0: Most strict filtering
   * - 1: Moderate filtering
   * - 2: Least strict filtering (for this endpoint)
   *
   * @default 2
   */
  safety_tolerance?: number;

  /**
   * @description The file format for the generated image.
   *
   * - "jpeg": Smaller file size, good for photographs, no transparency support
   * - "png": Lossless compression, supports transparency, best for images with text or sharp edges
   *
   * @default "png"
   */
  output_format?: "jpeg" | "png";

  /**
   * @description URL for asynchronous completion notification. When the image generation
   * completes, a POST request will be sent to this URL with the result.
   * Must be a valid HTTP/HTTPS URL.
   */
  webhook_url?: string;

  /**
   * @description Secret for webhook signature verification. This will be sent in the
   * X-Webhook-Secret header when the webhook is called.
   */
  webhook_secret?: string;
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  message?: string;
  error?: string;
}

// Constants for better maintainability
const POLLING_CONFIG = {
  MAX_ATTEMPTS: 60,
  INTERVAL_MS: 1500,
  TIMEOUT_MESSAGE: "Polling timeout: Image generation took too long",
} as const;

const CONTENT_TYPES = {
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
} as const;

const DEFAULT_VALUES = {
  aspect_ratio: "1:1",
  seed: null,
  prompt_upsampling: false,
  safety_tolerance: 2,
  output_format: "png",
} as const;

/**
 * Main image generation action handler
 */
export default async function generateImageAction(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GenerationResult> {
  const config = normalizeProps(props);
  const { fluxClient } = ctx;

  try {
    const requestPayload = createRequestPayload(config);

    if (config.presignedUrls?.length) {
      return await handleAsyncGeneration(
        fluxClient,
        requestPayload,
        config.presignedUrls,
      );
    }

    return await handleSyncGeneration(fluxClient, requestPayload);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Normalizes and validates input props with defaults
 */
function normalizeProps(props: Props) {
  return {
    ...props,
    aspect_ratio: props.aspect_ratio ?? DEFAULT_VALUES.aspect_ratio,
    seed: props.seed ?? DEFAULT_VALUES.seed,
    prompt_upsampling: props.prompt_upsampling ??
      DEFAULT_VALUES.prompt_upsampling,
    safety_tolerance: props.safety_tolerance ?? DEFAULT_VALUES.safety_tolerance,
    output_format: props.output_format ?? DEFAULT_VALUES.output_format,
  };
}

/**
 * Creates the request payload for FLUX API
 */
function createRequestPayload(
  config: ReturnType<typeof normalizeProps>,
): FluxImageGenerationRequest {
  return {
    prompt: config.prompt,
    aspect_ratio: config.aspect_ratio,
    seed: config.seed,
    prompt_upsampling: config.prompt_upsampling,
    safety_tolerance: config.safety_tolerance,
    output_format: config.output_format,
    webhook_url: config.webhook_url || null,
    webhook_secret: config.webhook_secret || null,
  };
}

/**
 * Handles asynchronous image generation with presigned URLs
 */
async function handleAsyncGeneration(
  fluxClient: ReturnType<typeof import("../client.ts").createFluxClient>,
  requestPayload: FluxImageGenerationRequest,
  presignedUrls: string[],
): Promise<GenerationResult> {
  const response = await fluxClient["POST /v1/flux-kontext-pro"]({}, {
    body: requestPayload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Initial FLUX request failed: ${response.status} ${errorText}`,
    );
  }

  const result = await response.json();

  // Fire and forget async processing
  queueAsyncProcessing(
    result.id,
    fluxClient,
    presignedUrls,
    requestPayload.output_format || "jpeg",
  );

  return {
    success: true,
    message:
      "Image generation started. The image will be uploaded to the provided URLs when ready.",
  };
}

/**
 * Handles synchronous image generation
 */
async function handleSyncGeneration(
  fluxClient: ReturnType<typeof import("../client.ts").createFluxClient>,
  requestPayload: FluxImageGenerationRequest,
): Promise<GenerationResult> {
  const response = await fluxClient["POST /v1/flux-kontext-pro"]({}, {
    body: requestPayload,
  });

  const result = await response.json();
  const finalResult = await pollForResult(fluxClient, result.id);

  if (finalResult.status === "Ready" && finalResult.result?.sample) {
    return {
      success: true,
      imageUrl: finalResult.result.sample,
      message:
        "Image generated successfully. Note: The URL is valid for 10 minutes.",
    };
  }

  if (finalResult.status === "Error") {
    throw new Error(finalResult.error || "Image generation failed");
  }

  throw new Error(`Unexpected status: ${finalResult.status}`);
}

/**
 * Queues async processing without blocking the main thread
 */
function queueAsyncProcessing(
  requestId: string,
  fluxClient: ReturnType<typeof import("../client.ts").createFluxClient>,
  presignedUrls: string[],
  outputFormat: string,
): void {
  setTimeout(async () => {
    try {
      await processImageGenerationAsync(
        requestId,
        fluxClient,
        presignedUrls,
        outputFormat,
      );
    } catch (error) {
      console.error("Async image generation failed:", error);
      await handleAsyncError(presignedUrls, error);
    }
  }, 0);
}

/**
 * Handles errors in async processing by writing to presigned URLs
 */
async function handleAsyncError(
  presignedUrls: string[],
  error: unknown,
): Promise<void> {
  const errorMessage = error instanceof Error
    ? error.message
    : "Unknown error occurred";

  try {
    await Promise.all(
      presignedUrls.map((url) =>
        writeErrorToPresignedUrl(url, `Generation failed: ${errorMessage}`)
      ),
    );
  } catch (writeError) {
    console.error("Failed to write error to presigned URLs:", writeError);
  }
}

/**
 * Polls the FLUX API for the result of an image generation request
 */
async function pollForResult(
  fluxClient: ReturnType<typeof import("../client.ts").createFluxClient>,
  requestId: string,
): Promise<FluxResultResponse> {
  for (let attempt = 0; attempt < POLLING_CONFIG.MAX_ATTEMPTS; attempt++) {
    await sleep(POLLING_CONFIG.INTERVAL_MS);

    try {
      const response = await fluxClient["GET /v1/get_result"]({
        id: requestId,
      });
      const result = await response.json();

      console.log(`Polling attempt ${attempt + 1}: Status ${result.status}`);

      if (result.status === "Ready" || result.status === "Error") {
        return result;
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);

      if (attempt === POLLING_CONFIG.MAX_ATTEMPTS - 1) {
        throw error;
      }
    }
  }

  throw new Error(POLLING_CONFIG.TIMEOUT_MESSAGE);
}

/**
 * Processes image generation asynchronously and uploads to presigned URLs
 */
async function processImageGenerationAsync(
  requestId: string,
  fluxClient: ReturnType<typeof import("../client.ts").createFluxClient>,
  presignedUrls: string[],
  outputFormat: string,
): Promise<void> {
  const finalResult = await pollForResult(fluxClient, requestId);

  if (finalResult.status === "Ready" && finalResult.result?.sample) {
    const imageBuffer = await downloadImage(finalResult.result.sample);
    await uploadImageToAllUrls(imageBuffer, presignedUrls, outputFormat);
    return;
  }

  if (finalResult.status === "Error") {
    throw new Error(finalResult.error || "Image generation failed");
  }

  throw new Error(`Unexpected status: ${finalResult.status}`);
}

/**
 * Downloads an image from a URL and returns the buffer
 */
async function downloadImage(imageUrl: string): Promise<ArrayBuffer> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  return await response.arrayBuffer();
}

/**
 * Uploads image buffer to all provided presigned URLs
 */
async function uploadImageToAllUrls(
  imageBuffer: ArrayBuffer,
  presignedUrls: string[],
  outputFormat: string,
): Promise<void> {
  await Promise.all(
    presignedUrls.map((url) =>
      uploadImageToPresignedUrl(imageBuffer, url, outputFormat)
    ),
  );
}

/**
 * Uploads an image buffer to a presigned URL with proper content type detection
 */
async function uploadImageToPresignedUrl(
  imageBuffer: ArrayBuffer,
  presignedUrl: string,
  format: string,
): Promise<void> {
  const contentType = detectContentTypeFromUrl(presignedUrl, format);

  console.log(
    `Uploading image with Content-Type: ${contentType} to URL: ${presignedUrl}`,
  );

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: imageBuffer,
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    const errorText = await safeGetResponseText(response);
    throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
  }

  console.log("Successfully uploaded image to presigned URL");
}

/**
 * Writes an error message to a presigned URL
 */
async function writeErrorToPresignedUrl(
  presignedUrl: string,
  errorMessage: string,
): Promise<void> {
  const errorBuffer = new TextEncoder().encode(errorMessage);
  const contentType = detectContentTypeFromUrl(presignedUrl, "jpeg");

  console.log(
    `Writing error with Content-Type: ${contentType} to URL: ${presignedUrl}`,
  );

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: errorBuffer,
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    throw new Error(`Failed to write error to URL: ${response.status}`);
  }

  console.log("Successfully wrote error message to presigned URL");
}

/**
 * Detects content type from URL path with fallback
 */
function detectContentTypeFromUrl(
  presignedUrl: string,
  fallbackFormat: string,
): string {
  try {
    const url = new URL(presignedUrl);
    const pathname = url.pathname.toLowerCase();

    for (const [extension, contentType] of Object.entries(CONTENT_TYPES)) {
      if (pathname.endsWith(`.${extension}`)) {
        return contentType;
      }
    }
  } catch (error) {
    console.warn(
      "Failed to parse presigned URL, using fallback content type:",
      error,
    );
  }

  return `image/${fallbackFormat}`;
}

/**
 * Safely gets response text without throwing
 */
async function safeGetResponseText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "Unknown error";
  }
}

/**
 * Handles and formats errors consistently
 */
function handleError(error: unknown): GenerationResult {
  console.error("Image generation error:", error);

  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error occurred",
  };
}

/**
 * Promisified setTimeout for cleaner async code
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
