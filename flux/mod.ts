import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createFluxClient } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

export interface State {
  fluxClient: ReturnType<typeof createFluxClient>;
}

export interface Props {
  /**
   * @description Your FLUX API key from BFL
   */
  apiKey: Secret | string;

  /**
   * @description Base URL for the FLUX API
   * @default https://api.bfl.ai/v1
   */
  baseUrl?: string;
}

/**
 * @title FLUX
 * @appName flux
 * @description Generate high-quality images from text prompts with FLUX AI.
 * @category AI
 * @logo https://images.flux1.ai/flux-logo.png
 */
export default function FluxApp(props: Props): App<Manifest, State> {
  const { apiKey, baseUrl = "https://api.bfl.ai/v1" } = props;

  const fluxClient = createFluxClient(
    typeof apiKey === "string" ? apiKey : apiKey.get() || "",
    baseUrl,
  );

  return {
    state: {
      fluxClient,
    },
    manifest,
    dependencies: [],
  };
}

export type FluxApp = ReturnType<typeof FluxApp>;
export type AppContext = AC<FluxApp>;
