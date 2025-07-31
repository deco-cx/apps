import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createFX1001Client } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

export interface State {
  api: ReturnType<typeof createFX1001Client>;
}

export interface Props {
  /**
   * @description Your 1001fx API key
   */
  apiKey: Secret | string;
}

/**
 * @title 1001fx
 * @appName 1001fx
 * @description Process and transform audio and video using AI-powered tools.
 * @category Media
 * @logo https://assets.decocache.com/mcp/b9109fab-421a-4275-911d-cec5651737d2/1001fx.svg
 */
export default function FX1001App(props: Props): App<Manifest, State> {
  const { apiKey } = props;

  const api = createFX1001Client(
    typeof apiKey === "string" ? apiKey : apiKey.get() || "",
  );

  return {
    state: {
      api,
    },
    manifest,
    dependencies: [],
  };
}

export type FX1001App = ReturnType<typeof FX1001App>;
export type AppContext = AC<FX1001App>;
