import { AppContext } from "../mod.ts";
import { ImageToVideoResultResponse } from "../stabilityAiClient.ts";

/**
 * @title Get Image to Video Status & Upload Result
 * @name IMAGE_TO_VIDEO_RESULT
 * @description Fetches the status of an image-to-video generation. If complete and a presigned URL is provided, uploads the result.
 */
export interface Props {
  /**
   * @description The ID of the generation process obtained from 'Start Image to Video Generation'.
   */
  generationId: string;
  /**
   * @description Optional presigned URL to upload the generated video to if the generation is complete. If provided, the final video URL will be returned upon successful upload.
   */
  presignedUrl?: string;
}

/**
 * @title Image to Video Status/Result URL
 * @description The current status of the generation or the final URL after upload.
 */
export interface Output {
  /**
   * @description The current status ("in-progress", "complete", "uploaded", or "error"). "complete" means generated but not uploaded (no presigned URL).
   */
  status: "in-progress" | "complete" | "uploaded" | "error";
  /**
   * @description The final URL of the video after uploading to the presigned URL. Only present if status is "uploaded".
   */
  videoUrl?: string;
  /**
   * @description Details in case of an error during fetching or upload.
   */
  error?: string;
}

// Helper function to upload the video buffer
async function uploadVideo(
  videoBuffer: ArrayBuffer,
  presignedUrl: string,
): Promise<string> {
  console.log(
    `Starting video upload to presigned URL. Size: ${videoBuffer.byteLength}`,
  );

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: videoBuffer,
    headers: {
      // Assuming presigned URL doesn't strictly require content-type or defaults appropriately
      // If upload fails, you might need to explicitly set 'Content-Type': 'video/mp4'
      // but we don't have the original type info easily here anymore.
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload failed with status:", response.status, errorText);
    throw new Error(
      `Failed to upload video (status ${response.status}): ${errorText}`,
    );
  }

  // Assuming the presigned URL pattern allows deriving the final URL
  const finalUrl = presignedUrl.split("?")[0];
  console.log("Video uploaded successfully. Final URL:", finalUrl);
  return finalUrl;
}

export default async function imageToVideoResult(
  { generationId, presignedUrl }: Props,
  _request: Request,
  ctx: AppContext,
): Promise<Output> {
  const { stabilityClient } = ctx;

  if (!stabilityClient) {
    console.error("Stability AI client is not available.");
    return {
      status: "error",
      error: "Stability AI client is not available. Check configuration.",
    };
  }

  if (!generationId) {
    return {
      status: "error",
      error: "Generation ID is required.",
    };
  }

  console.log(`Fetching status for video generation ID: ${generationId}`);

  try {
    // Explicitly type the result here for clarity, though inference should work
    const result: ImageToVideoResultResponse | {
      status: "error";
      error: string;
    } = await stabilityClient.imageToVideoResult(generationId, {
      accept: "video/*", // Request video/* in case it's ready
    });

    if (result.status === "complete") {
      console.log("Video generation complete.");
      // Add type guard: Ensure result.video exists and is an ArrayBuffer before uploading
      if (presignedUrl && result.video instanceof ArrayBuffer) {
        try {
          const replacedUrl = presignedUrl.replace("_presigned/", "");
          // Check if the presigned URL already has content
          console.log("Checking presigned URL content length...");
          const headResponse = await fetch(replacedUrl, { method: "GET" });
          const length = headResponse.headers.get("content-length");
          console.log("Presigned URL content:", length);
          const contentLength = headResponse.headers.get("content-length");
          console.log(
            `Presigned URL HEAD response status: ${headResponse.status}, Content-Length: ${contentLength}`,
          );

          if (
            headResponse.ok && contentLength && parseInt(contentLength, 10) > 0
          ) {
            console.log(
              "Presigned URL already has content. Skipping upload.",
            );
            const finalUrl = presignedUrl.split("?")[0];
            return {
              status: "uploaded",
              videoUrl: finalUrl.replace("_presigned/", ""), // Keep the replace logic
            };
          }

          // If no content or HEAD request failed, proceed with upload
          const finalUrl = await uploadVideo(result.video, presignedUrl);
          return {
            status: "uploaded",
            videoUrl: finalUrl.replace("_presigned/", ""),
          };
        } catch (uploadError) {
          return {
            status: "error",
            error: uploadError instanceof Error
              ? uploadError.message
              : "Video upload failed.",
          };
        }
      } else if (presignedUrl) {
        // Complete status, presignedUrl provided, but no video buffer?
        console.error(
          "Generation complete but video buffer is missing or not an ArrayBuffer. Cannot upload.",
        );
        return {
          status: "error",
          error:
            "Generation complete, but video data was missing or invalid for upload.",
        };
      } else {
        // Generation is complete, but no URL provided to upload
        console.log("Video generated, but no presigned URL provided.");
        return {
          status: "complete",
          error: "No presigned URL provided for upload.", // Indicate why it wasn't uploaded
        };
      }
    } else if (result.status === "in-progress") {
      console.log("Video generation is still in progress.");
      return { status: "in-progress" };
    } else { // status === "error"
      console.error("API returned an error status:", result.error);
      return { status: "error", error: result.error };
    }
  } catch (error) {
    console.error("Error fetching/processing image-to-video result:", error);
    return {
      status: "error",
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching the result.",
    };
  }
}
