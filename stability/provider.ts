import {
  type FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from "npm:@ai-sdk/provider-utils@2.0.5";
import { StabilityImageModel } from "./image-model.ts";
import type {
  StabilityImageModelId,
  StabilityImageSettings,
} from "./settings.ts";
import type {
  ExtendedImageModel,
  ExtendedImageProvider,
} from "./image-provider.ts";

export interface StabilityProvider extends ExtendedImageProvider {
  (
    modelId: StabilityImageModelId,
    settings?: StabilityImageSettings,
  ): ExtendedImageModel;
  image(
    modelId: string,
    settings?: StabilityImageSettings,
  ): ExtendedImageModel;
}

export interface StabilityProviderSettings {
  baseURL?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  fetch?: FetchFunction;
}

export function createStability(
  _options: StabilityProviderSettings = {},
): StabilityProvider {
  const options = {
    ..._options,
    headers: { ..._options.headers, accept: "application/json" },
  };

  const baseURL = withoutTrailingSlash(options.baseURL) ??
    "https://api.stability.ai/v2beta";

  const getHeaders = () => ({
    Authorization: `Bearer ${
      loadApiKey({
        apiKey: options.apiKey,
        environmentVariableName: "STABILITY_API_KEY",
        description: "Stability",
      })
    }`,
    ...options.headers,
  });

  function createImageModel(
    modelId: StabilityImageModelId,
  ): ExtendedImageModel {
    return new StabilityImageModel(modelId, {
      provider: "stability.image",
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });
  }

  const provider = function (modelId: StabilityImageModelId) {
    return createImageModel(modelId);
  };
  provider.image = createImageModel;

  return provider;
}

export const stability: StabilityProvider = createStability({
  headers: { accept: "application/json" },
});
