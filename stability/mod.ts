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
 * @name Stability
 * @description This uses the Stability AI API to generate images from text descriptions. A presigned URL is required to upload the result of any tool call.
 * @category Tool
 * @logo https://logowik.com/content/uploads/images/stability-ai-icon3444.logowik.com.webp
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
