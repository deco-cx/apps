import type {
  ImageModelV1,
  ImageModelV1CallOptions,
} from "npm:@ai-sdk/provider@1.0.11";
import type { ImageResponse } from "./types.ts";

export interface ExtendedImageModelCallOptions
  extends Omit<ImageModelV1CallOptions, "prompt" | "headers"> {
  prompt?: string;
  negativePrompt?: string;
  image?: string | Blob;
  headers?: Record<string, string>;
}

export interface ExtendedImageModel extends Omit<ImageModelV1, "doGenerate"> {
  /**
   * Returns either an ImageSyncResponse or an ImageAsyncResponse.
   *
   * For providers/models that don't work with async tasks and polling,
   * will just return a ImageSyncResponse.
   */
  doGenerate(
    {
      prompt,
      negativePrompt,
      image,
      providerOptions,
      abortSignal,
    }: ExtendedImageModelCallOptions,
  ): Promise<ImageResponse>;

  /**
   * Returns either an ImageSyncResponse for a completed task,
   * or an ImageAsyncResponse for a pending task.
   */
  getImage(id: string): Promise<ImageResponse>;
}

export interface ExtendedImageProvider {
  image: (modelId: string) => ExtendedImageModel;
}

export class GetImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GetImageError";
  }
}
