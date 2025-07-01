import { AppContext } from "../mod.ts";
import { Buffer } from "node:buffer";
import { uploadImage } from "./generateImage.ts";

/**
 * @title Edit Image
 * @description Modifies existing images or creates new composite images based on text prompts and reference images.
 * This action provides three main capabilities:
 * 1. Edit parts of an image using a mask (inpainting)
 * 2. Create a new image using multiple reference images
 * 3. Apply simple edits to a single image
 *
 * The behavior varies based on which parameters you provide (image only, image + mask, or multiple reference images).
 * Different models have different capabilities and limitations for image editing.
 */
export interface Props {
  /**
   * @description The presigned URL to upload the edited image to. The image will be
   * uploaded to this URL rather than returned as base64 in the response.
   *
   * Can be obtained from a CREATE_PRESIGNED_URL tool or similar functionality that creates S3/cloud storage
   * presigned URLs with PUT permission.
   */
  presignedUrl: string;

  /**
   * @description The text prompt that describes how you want to edit the image or what you want the final result to look like.
   * Be specific about what changes you want to make or what content you want to add to the image.
   *
   * For masked edits (inpainting), describe what should replace the masked area, but also include context about
   * the entire desired image to ensure coherence.
   *
   * For multi-image edits, describe how the reference images should be combined or arranged.
   *
   * @example "Place these products in a beautiful gift basket with a red ribbon"
   * @example "Replace the pool area with a flamingo-shaped pool float on crystal blue water"
   */
  prompt: string;

  /**
   * @description URL to the primary image you want to edit. This is required for all edit operations.
   * The image must be accessible via HTTP/HTTPS and in a supported format (PNG, JPEG, WebP).
   *
   * For best results:
   * - Use images under 20MB
   * - Use images with clear subjects and good lighting
   * - Provide images in the aspect ratio close to your desired output
   *
   * If you're using multiple reference images, this will be treated as the main image.
   */
  imageUrl: string;

  /**
   * @description URL to a mask image that indicates which parts of the primary image should be edited.
   * The mask should have the EXACT same dimensions as the primary image.
   *
   * In the mask image:
   * - Transparent/alpha areas indicate regions TO BE EDITED (will be replaced according to prompt)
   * - Opaque/black areas indicate regions TO BE PRESERVED (will remain unchanged)
   *
   * Requirements:
   * - Must have an alpha channel
   * - Must be the same size as the primary image
   * - Must be less than 25MB
   * - Must be in PNG format
   *
   * If both maskUrl and referenceImageUrls are provided, the mask takes precedence and the operation
   * will be treated as an inpainting edit with mask.
   */
  maskUrl?: string;

  /**
   * @description Array of URLs to additional reference images (up to 3 additional images) to use as visual context.
   * These images will be considered alongside the primary image to create a new composite image based on the prompt.
   *
   * This is useful for:
   * - Creating a scene with multiple objects from different images
   * - Combining elements from multiple images into one composition
   * - Providing visual examples for the style or content you want
   *
   * Limitations:
   * - Maximum 4 total images (1 primary + 3 reference)
   * - All images must be under 20MB
   * - Only used if maskUrl is NOT provided
   * - Works best when images are related or similar in style
   *
   * @example ["https://example.com/product1.png", "https://example.com/product2.png"]
   */
  referenceImageUrls?: string[];

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
}

export default function editImageAction(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const {
    presignedUrl,
    prompt,
  } = props;

  // Process the image editing asynchronously without awaiting
  setTimeout(() => {
    processImageEdit(props, ctx)
      .catch((error) => {
        console.error("Async image editing failed:", error);
        // If there's an error, write the error message to the presigned URL
        writeErrorToPresignedUrl(
          presignedUrl,
          "This generation has failed." + error,
        )
          .catch((err) => {
            console.error(
              "Failed to write error message to presigned URL:",
              err,
            );
          });
      });
  }, 0);

  return {
    success: true,
    message: "Image editing started.",
    model: "gpt-image-1",
    prompt,
  };
}

// Helper function to fetch image and convert to File with proper MIME type
async function fetchImageAsFile(url: string, fileName: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  // Get Content-Type from response or infer from file extension
  let contentType = response.headers.get("content-type");
  if (!contentType || contentType === "application/octet-stream") {
    const extension = url.split(".").pop()?.toLowerCase();
    if (extension === "jpg" || extension === "jpeg") {
      contentType = "image/jpeg";
    } else if (extension === "webp") {
      contentType = "image/webp";
    } else {
      contentType = "image/png";
    }
  }

  const data = await response.arrayBuffer();

  // Create a File object directly instead of using toFile
  return new File(
    [data],
    fileName,
    { type: contentType },
  );
}

/**
 * Processes image editing and uploads to presigned URL
 */
async function processImageEdit(props: Props, ctx: AppContext) {
  const {
    presignedUrl,
    prompt,
    imageUrl,
    maskUrl,
    referenceImageUrls = [],
    size = "1024x1024",
  } = props;

  if (!presignedUrl) {
    throw new Error("Presigned URL is required for async processing");
  }

  const openAI = ctx.openAI;
  // Build request parameters
  const requestParams: Record<string, unknown> = {
    model: "gpt-image-1",
    prompt,
    size,
  };

  // Fetch the primary image
  const imageFile = await fetchImageAsFile(
    imageUrl,
    `image.${imageUrl.split(".").pop()?.toLowerCase() || "png"}`,
  );

  // Handle different editing scenarios
  if (maskUrl) {
    // Inpainting with mask
    const maskFile = await fetchImageAsFile(maskUrl, "mask.png");
    requestParams.image = imageFile;
    requestParams.mask = maskFile;
  } else if (referenceImageUrls.length > 0) {
    // Multi-image edit
    const images = [imageFile];

    // Add reference images (up to 4 total including the main image)
    const maxReferenceImages = 3;
    for (
      let i = 0;
      i < Math.min(referenceImageUrls.length, maxReferenceImages);
      i++
    ) {
      try {
        const refFile = await fetchImageAsFile(
          referenceImageUrls[i],
          `ref_${i}.${
            referenceImageUrls[i].split(".").pop()?.toLowerCase() || "png"
          }`,
        );
        images.push(refFile);
      } catch (err) {
        console.error(`Failed to fetch reference image ${i}:`, err);
      }
    }

    requestParams.image = images;
  } else {
    // Simple edit with just the main image
    requestParams.image = imageFile;
  }

  const result = await openAI.images.edit(requestParams);

  if (result.data.length > 0) {
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

    await uploadImage(imageData, presignedUrl);
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
  } catch (error) {
    console.error("Error writing to presigned URL:", error);
    throw error;
  }
}
