import type { FetchFunction } from "npm:@ai-sdk/provider-utils@2.0.5";
import type { ImagePayload, ImageResponse } from "./types.ts";
import type { StabilityImageModelId } from "./settings.ts";
import {
  mapSdkToStabilityRequest,
  mapStabilityToSdkResponse,
} from "./mapper.ts";
import {
  type ExtendedImageModel,
  GetImageError,
} from "./image-provider.ts";
import {
  EnglishOnlyError,
  InvalidParametersError,
  RateLimitError,
  SensitiveContentError,
} from "./errors.ts";

interface StabilityImageConfig {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  fetch?: FetchFunction;
}

export class StabilityImageModel implements ExtendedImageModel {
  readonly specificationVersion = "v1";
  readonly modelId: StabilityImageModelId;
  readonly maxImagesPerCall: number | undefined;
  private readonly config: StabilityImageConfig;

  get provider(): string {
    return this.config.provider;
  }

  constructor(modelId: StabilityImageModelId, config: StabilityImageConfig) {
    this.modelId = modelId;
    this.config = config;
  }

  private getEndpoint(modelId: StabilityImageModelId): string {
    switch (modelId) {
      case "core":
      case "ultra":
        return `generate/${modelId}`;
      case "conservative":
      case "creative":
      case "fast":
        return `upscale/${modelId}`;
      case "erase":
      case "search-and-replace":
      case "search-and-recolor":
      case "remove-background":
      case "inpaint":
      case "outpaint":
      case "replace-background-and-relight":
        return `edit/${modelId}`;
      case "sketch":
      case "structure":
      case "style":
        return `control/${modelId}`;
      default:
        throw new Error(`Unsupported Stability model ID: ${modelId}`);
    }
  }

  async doGenerate(
    {
      prompt,
      negativePrompt,
      image,
      providerOptions,
      abortSignal,
    }: ExtendedImageModelCallOptions,
  ): Promise<ImageResponse> {
    console.log({prompt, negativePrompt})
    const endpointPath = this.getEndpoint(this.modelId);
    const url = `${this.config.baseURL}/stable-image/${endpointPath}`;

    const hasImage = image !== undefined;
    const hasStrength =
      typeof providerOptions?.stability?.strength === "number";
    const defaultStrength = 0.75;

    let strength = providerOptions?.stability?.strength as
      | number
      | undefined;

    if (hasImage && !hasStrength) {
      strength = defaultStrength;
    } else if (!hasImage && hasStrength) {
      strength = undefined;
    }

    const payload: ImagePayload = {
      prompt,
      negativePrompt,
      image,
      model: `stability:${this.modelId}` as ImagePayload["model"],
      providerOptions: {
        ...providerOptions,
        stability: {
          ...providerOptions?.stability,
          strength,
        },
      },
    };

    const formData = await mapSdkToStabilityRequest(payload);

    const headers = {
      ...this.config.headers(),
      ...payload.headers,
    } as HeadersInit;

    const response = await (this.config.fetch ?? fetch)(url, {
      method: "POST",
      headers,
      body: formData,
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(
        `Stability request failed with status ${response.status}: ${await response
          .text()}`,
      );
    }

    return await mapStabilityToSdkResponse(response, "image");
  }

  async getImage(id: string): Promise<ImageResponse> {
    const url = `${this.config.baseURL}/results/${id}`;
    const response = await (this.config.fetch ?? fetch)(url, {
      method: "GET",
      headers: this.config.headers() as HeadersInit,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorStatus = response.status;
      const errorJson = JSON.parse(errorText);

      if (errorStatus === 400) {
        throw new InvalidParametersError(
          "The parameters or media are invalid. Please try again.",
        );
      }
      if (
        errorStatus === 403 ||
        (errorStatus === 422 && errorJson.name === ("public_figure"))
      ) {
        throw new SensitiveContentError(
          "The media contains sensitive content or public figure and cannot be processed.",
        );
      }
      if (errorStatus === 413) {
        throw new InvalidParametersError(
          "The request is too large. Please try again with a smaller request.",
        );
      }
      if (errorStatus === 422 && errorJson.name === ("invalid_language")) {
        throw new EnglishOnlyError(
          "The prompt must be in English.",
        );
      }
      if (errorStatus === 429) {
        throw new RateLimitError(
          "Please try again later.",
        );
      }
      throw new GetImageError(
        `Stability status check failed with ${response.status}: ${errorText}`,
      );
    }

    return await mapStabilityToSdkResponse(response, "image");
  }
}
