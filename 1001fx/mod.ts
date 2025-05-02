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
 * @name 1001fx
 * @description 1001fx API integration for audio and video processing
 * @category Media
 * @logo https://1001fx.com/favicon.ico
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
