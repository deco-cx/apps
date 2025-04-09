import { getCodecs } from "../../website/utils/image/engines/wasm/codecs.ts";
import { transform } from "../../website/utils/image/engines/wasm/worker.ts";

export const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_PIXELS = 1_048_576; // Maximum pixels allowed by the API

type ImageType = "image/png" | "image/jpeg" | "image/webp" | "image/avif";

// Detect image type from the buffer
export function detectImageType(buffer: Uint8Array): ImageType | null {
  // PNG signature
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  // JPEG signature
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return "image/jpeg";
  }

  // WebP signature
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 &&
    buffer[3] === 0x57
  ) {
    return "image/webp";
  }

  // AVIF signature
  if (
    buffer[0] === 0x66 && buffer[1] === 0x74 && buffer[2] === 0x79 &&
    buffer[3] === 0x70
  ) {
    return "image/avif";
  }

  return null;
}

// Calculate dimensions that fit within pixel limit while maintaining aspect ratio
export function calculateDimensions(
  width: number,
  height: number,
  maxPixels = MAX_PIXELS,
) {
  const aspectRatio = width / height;
  let newWidth, newHeight;

  if (aspectRatio > 1) {
    // Landscape
    newWidth = Math.floor(Math.sqrt(maxPixels * aspectRatio));
    newHeight = Math.floor(newWidth / aspectRatio);
  } else {
    // Portrait
    newHeight = Math.floor(Math.sqrt(maxPixels / aspectRatio));
    newWidth = Math.floor(newHeight * aspectRatio);
  }

  return { width: newWidth, height: newHeight };
}

export async function compressImage(
  imageBuffer: Uint8Array,
): Promise<Uint8Array> {
  const codecs = await getCodecs();
  const imageType = detectImageType(imageBuffer) || "image/jpeg";
  const codec = codecs[imageType];
  const decode = codec?.decode;
  const encode = codec?.encode;

  if (!decode || !encode) {
    throw new Error("No suitable codec found for image type");
  }

  // First check dimensions and resize if needed
  const imageData = await decode(imageBuffer.buffer as ArrayBuffer);
  const totalPixels = imageData.width * imageData.height;

  let compressedBuffer = imageBuffer;

  // If image exceeds max pixels, resize first
  if (totalPixels > MAX_PIXELS) {
    console.log("Image exceeds maximum pixels, resizing first", {
      originalWidth: imageData.width,
      originalHeight: imageData.height,
      originalPixels: totalPixels,
    });

    const { width: newWidth, height: newHeight } = calculateDimensions(
      imageData.width,
      imageData.height,
    );
    console.log("Resizing to:", {
      newWidth,
      newHeight,
      newPixels: newWidth * newHeight,
    });

    const resizedData = await transform(
      {
        data: imageBuffer.buffer.slice(0) as ArrayBuffer,
        mediaType: imageType,
      },
      {
        width: newWidth,
        height: newHeight,
        fit: "contain",
        quality: 90, // Start with high quality
        mediaType: imageType,
      },
    );
    compressedBuffer = new Uint8Array(resizedData.data);
  }

  // Then proceed with quality reduction if still needed
  let quality = 60;
  let iteration = 1;

  while (compressedBuffer.byteLength > MAX_SIZE && quality >= 20) {
    console.log(`Quality compression attempt ${iteration}:`, {
      quality,
      currentSize: compressedBuffer.byteLength,
    });

    const currentImageData = await decode(
      compressedBuffer.buffer as ArrayBuffer,
    );
    const result = await transform(
      {
        data: compressedBuffer.buffer.slice(0) as ArrayBuffer,
        mediaType: imageType,
      },
      {
        width: currentImageData.width,
        height: currentImageData.height,
        fit: "contain",
        quality,
        mediaType: imageType,
      },
    );
    compressedBuffer = new Uint8Array(result.data);
    quality -= 10;
    iteration++;
  }

  if (compressedBuffer.byteLength > MAX_SIZE) {
    throw new Error(
      `Unable to compress image below size limit. Final size: ${compressedBuffer.byteLength} bytes`,
    );
  }

  return compressedBuffer;
}

export async function fetchAndProcessImage(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

export type ProcessImageOptions = {
  imageBuffer: Uint8Array;
  processFn: (buffer: Uint8Array) => Promise<Uint8Array>;
  maxRetries?: number;
};

export async function processImageWithCompression({
  imageBuffer,
  processFn,
  maxRetries = 2,
}: ProcessImageOptions): Promise<Uint8Array> {
  let currentBuffer = imageBuffer;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      return await processFn(currentBuffer);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("payload_too_large") ||
          error.message.includes("unsupported dimensions"))
      ) {
        console.log(
          `Compression attempt ${retryCount + 1}/${maxRetries} needed`,
        );

        if (retryCount === maxRetries) {
          throw new Error(
            `Failed to process image after ${maxRetries} compression attempts: ${error.message}`,
          );
        }

        currentBuffer = await compressImage(currentBuffer);
        retryCount++;
        continue;
      }
      throw error;
    }
  }

  throw new Error("Unexpected error in image processing");
}
