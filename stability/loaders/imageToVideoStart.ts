import { AppContext } from "../mod.ts";
import { ImageToVideoOptions } from "../stabilityAiClient.ts";
import {
  detectImageType,
  resizeImageToSupportedVideoDimensions,
} from "../utils/imageProcessing.ts";

/**
 * @title Start Image to Video Generation
 * @name IMAGE_TO_VIDEO_START
 * @description Starts the generation of a video based on an initial image URL. Returns the URL of the video preview. Use this URL if you have any tools that can render/preview urls or files.
 */
export interface Props extends ImageToVideoOptions {
  /**
   * @description The URL of the presigned URL to use for video generation. The video will be uploaded to this URL.
   * @required
   */

  presignedUrl: string;

  /**
   * @description The URL of the source image to use for video generation.
   * Supported Formats: jpeg, png
   * Supported Dimensions: 1024x576, 576x1024, 768x768
   */
  imageUrl: string;

  /**
   * @description A specific value that is used to guide the 'randomness' of the generation. (Omit this parameter or pass 0 to use a random seed.)
   * @format int64
   * @maximum 4294967294
   */
  seed?: number; // Defined in ImageToVideoOptions

  /**
   * @description How strongly the video sticks to the original image. Use lower values for more freedom, higher values to correct motion distortions.
   * @minimum 0
   * @maximum 10
   * @default 1.8
   */
  cfgScale?: number; // Defined in ImageToVideoOptions

  /**
   * @description Lower values = less motion, higher values = more motion. Corresponds to motion_bucket_id paper parameter.
   * @minimum 1
   * @maximum 255
   * @default 127
   */
  motionBucketId?: number; // Defined in ImageToVideoOptions
}

/**
 * @title Image to Video Start Result
 * @description The URL of the video preview. You can use this URL if you have any tools that can render/preview urls or files.
 */
export interface Output {
  /**
   * @description The URL of the video preview. You can use this URL if you have any tools that can render/preview urls or files.
   */
  previewUrl: string;
}

async function fetchImage(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image from ${url}: ${response.statusText}`,
    );
  }
  return new Uint8Array(await response.arrayBuffer());
}

export default async function imageToVideoStart(
  { imageUrl, seed, cfgScale, motionBucketId, presignedUrl }: Props,
  _request: Request,
  ctx: AppContext,
): Promise<Output> {
  const { stabilityClient, previewUrl } = ctx;

  if (!stabilityClient) {
    throw new Error(
      "Stability AI client is not available. Check your configuration.",
    );
  }

  if (!imageUrl) {
    throw new Error("Image URL is required.");
  }

  if (!presignedUrl) {
    throw new Error("Presigned URL is required.");
  }

  try {
    console.log(`Fetching image from URL: ${imageUrl}`);
    let imageBuffer = await fetchImage(imageUrl);
    console.log(
      `Image fetched successfully. Original size: ${imageBuffer.byteLength} bytes`,
    );

    const imageType = detectImageType(imageBuffer);
    if (!imageType || !["image/png", "image/jpeg"].includes(imageType)) {
      throw new Error(
        `Unsupported image type: ${
          imageType ?? "unknown"
        }. Only PNG and JPEG are supported.`,
      );
    }

    // Resize if necessary
    const { buffer: processedBuffer, type: processedType } =
      await resizeImageToSupportedVideoDimensions(
        imageBuffer,
        imageType,
      );
    imageBuffer = processedBuffer;

    // Convert buffer back to Blob for FormData
    const imageBlob = new Blob([imageBuffer], { type: processedType });
    console.log(
      `Processed image blob created. Size: ${imageBlob.size} bytes, Type: ${imageBlob.type}`,
    );

    // Prepare options, filtering out undefined values
    const options: ImageToVideoOptions = {};
    if (seed !== undefined) options.seed = seed;
    if (cfgScale !== undefined) options.cfgScale = cfgScale;
    if (motionBucketId !== undefined) {
      options.motionBucketId = Number(motionBucketId);
    }

    console.log("Starting image-to-video generation with options:", options);
    const result = await stabilityClient.imageToVideoStart(imageBlob, options);
    console.log("Image-to-video generation started. ID:", result.id);

    return {
      previewUrl: `${previewUrl}/${result.id}?presignedUrl=${presignedUrl}`,
    };
  } catch (error) {
    console.error("Error starting image-to-video generation:", error);
    if (error instanceof Error) {
      throw new Error(
        `Failed to start image-to-video generation: ${error.message}`,
      );
    }
    throw new Error("An unknown error occurred during image-to-video start.");
  }
}
