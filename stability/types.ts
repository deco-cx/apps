type ProviderOptions = Record<string, Record<string, any>>;

type ImageModel =
  | "stability:core"
  | "stability:ultra"
  | "stability:conservative"
  | "stability:creative"
  | "stability:fast"
  | "stability:erase"
  | "stability:inpaint"
  | "stability:outpaint"
  | "stability:search-and-replace"
  | "stability:search-and-recolor"
  | "stability:remove-background"
  | "stability:replace-background-and-relight"
  | "stability:sketch"
  | "stability:structure"
  | "stability:style";

export interface ImagePayload {
  model: string;
  /**
   * At least one of prompt or image must be provided.
   * Most image generation tasks require a prompt.
   * Image-to-image tasks (e.g., upscaling, inpainting) can optionally use
   * only an image, and omit the prompt.
   */
  prompt?: string;
  /**
   * Negative prompt to specify what should not be in the generated image
   */
  negativePrompt?: string;
  image?: string;
  /**
   * Number of images to generate. Defaults to 1.
   */
  n?: number;
  /**
   * Size of the generated image in format "widthxheight"
   */
  size?: `${number}x${number}`;
  /**
   * Aspect ratio of the generated image in format "width:height"
   */
  aspectRatio?: `${number}:${number}`;
  /**
   * Provider-specific options
   */
  providerOptions?: Record<string, Record<string, any>>;
  /**
   * Optional headers to pass to the provider
   */
  headers?: Record<string, string>;
  /**
   * Optional seed for image generation
   */
  seed?: number;
}

export interface ImageSyncResponse {
  images: Array<string>;
  warnings: Array<string>;
}

export interface ImageAsyncResponse {
  id: string;
  status: string;
}

export type ImageResponse = ImageSyncResponse | ImageAsyncResponse;
