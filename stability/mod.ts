import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { StabilityAiClient } from "./stabilityAiClient.ts";

export interface State {
  stabilityClient: StabilityAiClient;
  previewUrl: string;
}

interface Props {
  /**
   * @description The Stability AI API key
   */
  apiKey: Secret | string;
  /**
   * @description The URL of the preview used to render the video.
   */
  previewUrl: string;
}

/**
 * @title Stability
 * @appName stability
 * @description Create images from text using Stability AI’s diffusion models.
 * @category Tool
 * @logo https://assets.decocache.com/mcp/438d786a-4266-4196-876d-eccde1310e24/Stability.svg
 */
export default function Stability(props: Props): App<Manifest, State> {
  const { apiKey, previewUrl } = props;
  const stability = new StabilityAiClient(
    typeof apiKey === "string" ? apiKey : apiKey.get() || "",
  );

  return {
    state: {
      stabilityClient: stability,
      previewUrl,
    },
    manifest,
    dependencies: [],
  };
}

export type StabilityApp = ReturnType<typeof Stability>;
export type AppContext = AC<StabilityApp> & {
  stabilityClient: StabilityAiClient;
};
