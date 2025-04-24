import { AppContext } from "../mod.ts";
import { Buffer } from "node:buffer";
import { PREVIEW_URL } from "../loaders/imagePreview.ts";
import { createPreviewUrl, getInstallId } from "../utils.ts";
import OpenAI from "npm:openai";
/**
 * @title Generate Image
 * @description Creates high-quality images from text prompts using OpenAI's image generation models.
 * This action allows you to generate images by providing a descriptive prompt and customizing
 * various parameters to control the output. Different models have different capabilities and limitations,
 * so parameters should be chosen accordingly. The result will be available in the previewUrls. Use the full previewUrls to render the images.
 */
export interface Props {
  /**
   * @description The presigned URLs to upload the generated images to. When provided, the images will be
   * uploaded to these URLs rather than returned as base64 in the response. This allows for larger images
   * and easier integration with storage systems. One for each image. (n = number of images)
   *
   * Can be obtained from a CREATE_PRESIGNED_URL tool or similar functionality that creates S3/cloud storage
   * presigned URLs with PUT permission.
   */
  presignedUrls: string[];

  /**
   * @description The text prompt that describes the image you want to generate. For best results,
   * be specific and detailed about what you want to see in the image. Include details about style,
   * setting, lighting, composition, and other visual elements. The prompt has a maximum length
   * that varies by model (typically 1000 characters). The more detailed and specific your prompt,
   * the better the results will be.
   *
   * @example "A photorealistic image of a futuristic city with flying cars, tall glass buildings,
   * and a sunset in the background, 8k resolution, detailed lighting"
   */
  prompt: string;

  /**
   * @description The AI model to use for image generation. Each model has different capabilities:
   *
   * - gpt-image-1: OpenAI's newest model with superior instruction following, text rendering, and real-world knowledge
   * - dall-e-3: High quality images with good creative interpretation
   * - dall-e-2: Lower cost option, supports variations endpoint
   *
   * Note that each model has different parameter support. For example, dall-e-3 supports the 'style' parameter
   * but not 'variations', while gpt-image-1 supports 'quality' with more granular options and transparent backgrounds.
   *
   * @default gpt-image-1
   */
  model?: "gpt-image-1" | "dall-e-3" | "dall-e-2";

  /**
   * @description The dimensions of the generated image. Available sizes depend on the model:
   *
   * - Square (1024x1024): auto size, works with all models, fastest generation time
   * - Landscape (1536x1024): Good for scenic images, horizontally oriented content
   * - Portrait (1024x1536): Good for portraits, vertically oriented content
   *
   * Note: Larger sizes may take longer to generate and cost more. Different models support
   * different sizes - check model documentation if you encounter errors.
   *
   * @default 1024x1024
   */
  size?:
    | "256x256"
    | "512x512"
    | "1024x1024"
    | "1792x1024"
    | "1024x1792"
    | "1536x1024"
    | "1024x1536";

  /**
   * @description Controls the rendering quality and detail level of the generated image. Higher quality
   * settings produce more detailed images but take longer to generate and cost more.
   *
   * For gpt-image-1:
   * - low: Fastest generation, less detail (272 tokens for 1024x1024)
   * - medium: Balanced option (1056 tokens for 1024x1024)
   * - high: Most detailed images, slowest generation (4160 tokens for 1024x1024)
   *
   * For dall-e-3:
   * - auto: Normal quality
   * - hd: High definition quality (more detailed)
   *
   * Note: Quality options are interpreted differently depending on model. The dall-e-3 model
   * only supports 'auto' and 'hd', while gpt-image-1 supports 'low', 'medium', and 'high'.
   * If you specify 'hd' for gpt-image-1 or 'high' for dall-e-3, the API will map to the closest equivalent.
   *
   * @default auto
   */
  quality?: "auto" | "hd" | "low" | "medium" | "high";

  /**
   * @description Controls the stylistic approach for dall-e-3 model only. This parameter is ignored for other models.
   *
   * - vivid: Creates images with more intense, dramatic, and vibrant colors
   * - natural: Creates images with more subtle, realistic, and less saturated colors
   *
   * Use 'vivid' for more artistic or dramatic imagery, and 'natural' for more realistic scenes.
   * This parameter only works with the dall-e-3 model and is ignored by other models.
   *
   * @default vivid
   */
  style?: "vivid" | "natural";

  /**
   * @description The number of images to generate in a single request. Higher values allow batch generation
   * but may increase response time and costs. The maximum value depends on the model:
   *
   * - gpt-image-1: Up to 4 images per request
   * - dall-e-3: Up to 1 image per request
   * - dall-e-2: Up to 10 images per request
   *
   * Note: If you specify a value higher than the model supports, the API will automatically
   * use the maximum supported value for that model.
   *
   * When using presignedUrl, only the first image will be uploaded even if multiple images are generated.
   *
   * @default 1
   */
  n?: number;

  /**
   * @description The file format for the generated image(s). Each format has different characteristics:
   *
   * - png: Lossless compression, supports transparency, best for images with text or sharp edges
   * - jpeg: Smaller file size, lossy compression, good for photographs, no transparency support
   * - webp: Modern format with good compression and quality, supports transparency
   *
   * Note: The format affects whether transparency is supported and how compression works.
   * Only PNG and WebP support transparency. For best text rendering, use PNG format.
   *
   * @default png
   */
  format?: "png" | "jpeg" | "webp";

  /**
   * @description Controls whether the image has a transparent background or a solid color background.
   *
   * - opaque: auto solid background
   * - transparent: Transparent background (only works with png and webp formats)
   *
   * Important: Transparency only works with the 'png' and 'webp' formats. If you specify 'transparent'
   * with 'jpeg' format, the API will ignore the transparency setting. Also, transparency works best
   * with 'medium' or 'high' quality settings when using gpt-image-1.
   *
   * @default opaque
   */
  background?: "opaque" | "transparent";

  /**
   * @description Controls the compression level for 'jpeg' and 'webp' formats only.
   * Range is 0-100, where 0 is maximum compression (lowest quality) and 100 is minimum
   * compression (highest quality).
   *
   * - Low values (0-30): Small file size, visible compression artifacts
   * - Medium values (30-70): Balanced file size and quality
   * - High values (70-100): Larger file size, minimal compression artifacts
   *
   * This parameter is ignored for 'png' format. If not specified, the API uses default
   * compression settings.
   */
  compression?: number;

  /**
   * @description Controls how strictly content is filtered for the gpt-image-1 model.
   *
   * - auto: auto filtering that limits potentially age-inappropriate content
   * - low: Less restrictive filtering, allowing more creative freedom but still adhering to usage policies
   *
   * Note: Regardless of this setting, all prompts and generations are filtered according to
   * OpenAI's content policy. Explicit or prohibited content will still be blocked. This parameter
   * is only supported by the gpt-image-1 model and ignored by other models.
   *
   * @default auto
   */
  moderation?: "auto" | "low";
}

interface ImageResponse {
  b64_json?: string;
  url?: string;
  revised_prompt?: string;
}

export default async function generateImageAction(
  props: Props,
  req: Request,
  ctx: AppContext,
) {
  const {
    presignedUrls,
    prompt,
    model = "gpt-image-1",
    size = "1024x1024",
    quality = "auto",
    style,
    n = 1,
    format = "png",
    background = "opaque",
    compression,
    moderation = "auto",
  } = props;

  const openAI = ctx.openAI;
  const url = new URL(req.url);
  const installId = getInstallId(url);

  // If presigned URLs are provided, return preview URL
  if (presignedUrls && presignedUrls.length > 0) {
    const cleanedUrls = presignedUrls.map((url) =>
      url.split("?")[0].replace("_presigned/", "")
    );

    // Run image generation asynchronously without awaiting
    setTimeout(() => {
      processImageGeneration(props, openAI, presignedUrls, format)
        .catch((error) => {
          console.error("Async image generation failed:", error);
          ctx.log("Async image generation failed:", error);
          // If there's an error, write the error message to the presigned URLs
          Promise.all(
            presignedUrls.map((url) =>
              writeErrorToPresignedUrl(url, "This generation has failed." + error)
            ),
          ).catch((err) => {
            console.error(
              "Failed to write error message to presigned URL:",
              err,
            );
          });
        });
    }, 0);

    const previewUrls = cleanedUrls.map((url) =>
      createPreviewUrl(url, PREVIEW_URL, installId)
    );

    return {
      success: true,
      previewUrls,
      message:
        "Image generation started. Render the previewUrls to see the images.",
    };
  }

  // If no presigned URLs are provided, handle synchronously as before
  try {
    // Set up parameters based on model
    const requestParams: Record<string, unknown> = {
      model,
      prompt,
      n,
      size,
    };

    // Quality handling - gpt-image-1 uses quality, dall-e-3 uses quality_preference
    if (model === "gpt-image-1") {
      requestParams.quality = quality;
      if (
        background === "transparent" && (format === "png" || format === "webp")
      ) {
        requestParams.background = background;
      }
      if (moderation) {
        requestParams.moderation = moderation;
      }
    } else if (model === "dall-e-3") {
      // dall-e-3 uses different quality naming
      if (quality === "high" || quality === "hd") {
        requestParams.quality = "hd";
      } else {
        requestParams.quality = "auto";
      }
      if (style) {
        requestParams.style = style;
      }
    }

    // Add format and compression settings
    if (format !== "png") {
      if (
        compression !== undefined && (format === "jpeg" || format === "webp")
      ) {
        requestParams.output_compression = compression;
      }
    }

    const result = await openAI.images.generate(requestParams);

    return {
      success: true,
      images: result.data.map((img: ImageResponse) =>
        img.b64_json ? `data:image/${format};base64,${img.b64_json}` : img.url
      ),
      model,
      prompt,
    };
  } catch (error: unknown) {
    console.error("Error generating image:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Failed to generate image";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Processes image generation and uploads to presigned URLs
 */
async function processImageGeneration(
  props: Props,
  openAI: OpenAI,
  presignedUrls: string[],
  format: string,
) {
  const {
    prompt,
    model = "gpt-image-1",
    size = "1024x1024",
    quality = "auto",
    style,
    n = 1,
    background = "opaque",
    compression,
    moderation = "auto",
  } = props;

  // Set up parameters based on model
  // deno-lint-ignore no-explicit-any
  const requestParams: any = {
    model,
    prompt,
    n,
    size,
  };

  // Quality handling - gpt-image-1 uses quality, dall-e-3 uses quality_preference
  if (model === "gpt-image-1") {
    requestParams.quality = quality;
    if (
      background === "transparent" && (format === "png" || format === "webp")
    ) {
      requestParams.background = background;
    }
    if (moderation) {
      requestParams.moderation = moderation;
    }
  } else if (model === "dall-e-3") {
    // dall-e-3 uses different quality naming
    if (quality === "high" || quality === "hd") {
      requestParams.quality = "hd";
    } else {
      requestParams.quality = "auto";
    }
    if (style) {
      requestParams.style = style;
    }
  }

  // Add format and compression settings
  if (format !== "png") {
    if (compression !== undefined && (format === "jpeg" || format === "webp")) {
      requestParams.output_compression = compression;
    }
  }

  const result = await openAI.images.generate(requestParams);

  if (result.data && result.data.length > 0 && result.data[0]) {
    let imageData = result.data[0].b64_json;

    if (!imageData) {
      // If URL is returned instead of base64, we need to fetch it
      if (result.data[0].url) {
        const imgResponse = await fetch(result.data[0].url);
        const imgBlob = await imgResponse.blob();
        const buffer = await imgBlob.arrayBuffer();
        imageData = Buffer.from(buffer).toString("base64");
      } else {
        throw new Error("No image data or URL returned from OpenAI");
      }
    }

    if (!imageData) {
      throw new Error("No image data returned from OpenAI");
    }

    await Promise.all(presignedUrls.map(async (presignedUrl) => {
      return await uploadImage(imageData, presignedUrl, format);
    }));
  }
}

/**
 * Writes an error message to a presigned URL
 */
async function writeErrorToPresignedUrl(
  presignedUrl: string,
  errorMessage: string,
) {
  const textEncoder = new TextEncoder();
  const errorBuffer = textEncoder.encode(errorMessage);

  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: errorBuffer,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to write error to URL: ${response.status}`);
    }

    console.log("Successfully wrote error message to presigned URL");
  } catch (error) {
    console.error("Error writing to presigned URL:", error);
    throw error;
  }
}

/**
 * Uploads an image to a presigned URL
 * @param image Base64 encoded image data
 * @param presignedUrl The presigned URL to upload to
 * @param format Image format (png, jpeg, webp)
 * @returns The URL where the image is accessible
 */
export async function uploadImage(
  image: string,
  presignedUrl: string,
  format: string = "png",
): Promise<string> {
  console.log("Starting image upload...");
  console.log("Presigned URL:", presignedUrl);
  console.log("Image length:", image.length);

  const imageBuffer = new Uint8Array(Buffer.from(image, "base64"));
  console.log("Image buffer length:", imageBuffer.length);

  // Set the appropriate content type based on format
  const contentType = `image/${format}`;

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: imageBuffer,
    headers: {
      "Content-Type": contentType,
    },
  });

  console.log("Upload response status:", response.status);
  console.log(
    "Upload response headers:",
    Object.fromEntries(response.headers.entries()),
  );

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch {
      errorText = "Unknown error";
    }
    console.error("Upload failed with response:", errorText);
    throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
  }

  // Extract the URL from the presigned URL (removing query parameters)
  let resultUrl = presignedUrl.split("?")[0];

  // Some storage services return the final URL in the response
  try {
    const data = await response.json();
    if (data.url) {
      resultUrl = data.url;
    }
    console.log("Upload response data:", data);
  } catch (_error) {
    // If no JSON is returned, just use the base URL from the presigned URL
    console.log("No JSON returned in upload response, using base URL");
  }

  return resultUrl;
}
