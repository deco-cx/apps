import {
  type FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from "npm:@ai-sdk/provider-utils@3.0.10";
import { ElevenLabsAudioModel } from "./audio-model.ts";

/**
 * Configuration for creating an Eleven Labs provider instance.
 */
export interface ElevenLabsProviderSettings {
  baseURL?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  fetch?: FetchFunction;
}

/**
 * We only implement .audio() here. If you wanted text or images, you'd add them.
 */
export interface ElevenLabsProvider {
  (modelId: string, config?: ElevenLabsProviderSettings): ElevenLabsAudioModel;
  audio(
    modelId: string,
    config?: ElevenLabsProviderSettings,
  ): ElevenLabsAudioModel;
}

/**
 * Creates an ElevenLabs provider instance. Each `modelId` (e.g. "tts", "voice-changer")
 * is handled by our single "ElevenLabsAudioModel".
 */
export function createElevenLabs(
  options: ElevenLabsProviderSettings = {},
): ElevenLabsProvider {
  const baseURL = withoutTrailingSlash(options.baseURL) ??
    "https://api.elevenlabs.io";
  const getHeaders = () => ({
    "xi-api-key": loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: "ELEVENLABS_API_KEY",
      description: "ElevenLabs",
    }),
    ...options.headers,
  });

  function createAudioModel(modelId: string): ElevenLabsAudioModel {
    return new ElevenLabsAudioModel(modelId, {
      provider: "elevenlabs.audio",
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });
  }

  // The returned provider is both callable and has .audio
  const provider = function (modelId: string) {
    return createAudioModel(modelId);
  } as ElevenLabsProvider;

  provider.audio = createAudioModel;
  return provider;
}

/** Optional default instance. You can create more specialized instances as needed. */
export const elevenLabs: ElevenLabsProvider = createElevenLabs({
  headers: { Accept: "audio/mpeg" },
});
