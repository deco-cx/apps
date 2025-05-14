import { AppContext } from "../mod.ts";
import { Buffer } from "node:buffer";
import OpenAI from "npm:openai";

/**
 * @title Generate Image
 * @description Creates high-quality images from text prompts using OpenAI's image generation models.
 * This action allows you to generate images by providing a descriptive prompt and customizing
 * various parameters to control the output.
 */
export interface Props {
  /**
   * @description The presigned URLs to upload the generated images to. The images will be
   * uploaded to these URLs rather than returned as base64 in the response. One for each image. (n = number of images)
   *
   * Can be obtained from a CREATE_PRESIGNED_URL tool or similar functionality that creates S3/cloud storage
   * presigned URLs with PUT permission.
   */
  presignedUrls?: string[];

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
   * @description The dimensions of the generated output image. Available sizes depend on the model:
   *
   * - Square (1024x1024): Standard size, works with all models
   * - Landscape (1536x1024): Good for scenic images, horizontally oriented content
   * - Portrait (1024x1536): Good for portraits, vertically oriented content
   *
   * For inpainting with a mask, the output size should match the input image size for best results.
   * If the sizes don't match, the image might be stretched or distorted.
   *
   * @default 1024x1024
   */
  size?:
    | "1024x1024"
    | "1536x1024"
    | "1024x1536";

  /**
   * @description Controls the rendering quality and detail level of the generated image. Higher quality
   * settings produce more detailed images but take longer to generate and cost more.
   *
   * For gpt-image-1:
   * - low: Fastest generation, less detail
   * - medium: Balanced option
   * - high: Most detailed images, slowest generation
   *
   * Quality setting affects the rendering detail and token consumption. For precise edits requiring
   * fine details, use 'medium' or 'high' quality.
   *
   * @default auto
   */
  quality?: "low" | "medium" | "high" | "auto";

  /**
   * @description The number of images to generate in a single request. Higher values allow batch generation
   * but may increase response time and costs. The maximum value depends on the model:
   *
   * - gpt-image-1: Up to 4 images per request
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
  outputFormat?: "png" | "jpeg" | "webp";

  /**
   * @description Controls whether the image has a transparent background or a solid color background.
   *
   * - opaque: Standard solid background
   * - transparent: Transparent background (only works with png and webp formats)
   * - auto: Model automatically determines the best background type
   *
   * Important: Transparency only works with 'png' and 'webp' formats. If 'transparent' is specified
   * with 'jpeg' format, the transparency setting will be ignored. When using transparency, set the
   * output format to either png (default) or webp.
   *
   * Transparent backgrounds are useful for creating compositable elements that can be layered in
   * external editing tools.
   *
   * @default auto
   */
  background?: "opaque" | "transparent" | "auto";

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

export default function generateImageAction(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const {
    presignedUrls,
  } = props;

  const openAI = ctx.openAI;

  // If presigned URLs are provided, return preview URL
  if (presignedUrls && presignedUrls.length > 0) {
    // Run image generation asynchronously without awaiting
    setTimeout(() => {
      processImageGeneration(props, openAI, presignedUrls)
        .catch((error) => {
          console.error("Async image generation failed:", error);
          // If there's an error, write the error message to the presigned URLs
          Promise.all(
            presignedUrls.map((url) =>
              writeErrorToPresignedUrl(
                url,
                "This generation has failed." + error,
              )
            ),
          ).catch((err) => {
            console.error(
              "Failed to write error message to presigned URL:",
              err,
            );
          });
        });
    }, 0);

    return {
      success: true,
      message: "Image generation started.",
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
) {
  const {
    prompt,
    size = "1024x1024",
    quality = "auto",
    n = 1,
    background = "auto",
    outputFormat = "png",
    moderation = "auto",
  } = props;

  // Set up parameters based on model
  // deno-lint-ignore no-explicit-any
  const requestParams: any = {
    model: "gpt-image-1",
    prompt,
    n,
    size,
  };

  if (
    !(quality === "low" || quality === "medium" || quality === "high" ||
      quality === "auto")
  ) {
    throw new Error("Quality must be a valid quality value");
  }

  requestParams.quality = quality;
  if (
    background === "transparent" &&
    (outputFormat === "png" || outputFormat === "webp")
  ) {
    requestParams.background = background;
  }
  if (moderation) {
    requestParams.moderation = moderation;
  }

  if (outputFormat !== "png") {
    requestParams.output_format = outputFormat;
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
      return await uploadImage(imageData, presignedUrl, outputFormat);
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

  console.log({ contentType });

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
