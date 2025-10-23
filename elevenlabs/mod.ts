import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createElevenLabs, type ElevenLabsProvider } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

// Export the new action type
export { default as TranscribeAudio } from "./actions/transcribeAudio.ts";

interface State {
  elevenLabs: ElevenLabsProvider;
  // Store apiKey in state for direct access in actions if needed
  elevenLabsApiKey?: string;
}

interface Props {
  /**
   * @description The ElevenLabs API key to use
   */
  apiKey: Secret | string;
  /**
   * @description Custom base URL for the API
   */
  baseURL?: string;
  /**
   * @description Additional headers to be sent with each request
   */
  headers?: Record<string, string>;
}

/**
 * @title ElevenLabs
 * @appName elevenlabs
 * @description Turn text into realistic speech with ElevenLabs voice models.
 * @category Tool
 * @logo https://assets.decocache.com/mcp/d5b8b14e-7611-4cdd-8453-cad6a4c23703/ElevenLabs.svg
 */
export default function ElevenLabs(props: Props): App<Manifest, State> {
  const { apiKey, baseURL, headers } = props;
  const resolvedApiKey = typeof apiKey === "string"
    ? apiKey
    : apiKey.get() || "";
  const elevenLabs = createElevenLabs({
    apiKey: resolvedApiKey,
    baseURL,
    headers,
  });

  return {
    state: {
      elevenLabs,
      elevenLabsApiKey: resolvedApiKey, // Pass API key to state
    },
    manifest,
    dependencies: [],
  };
}

export type ElevenLabsApp = ReturnType<typeof ElevenLabs>;
export type AppContext = AC<ElevenLabsApp>;
