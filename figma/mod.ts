import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { FigmaClient } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

export interface Props {
  /**
   * @description Figma API access token for authentication
   */
  accessToken: string | Secret;
}

export interface State extends Props {
  figma: FigmaClient;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @name Figma
 * @title Figma
 * @description A Deco app to interact with the Figma APIs with strongly typed responses.
 * @logo https://upload.wikimedia.org/wikipedia/commons/a/ad/Figma-1-logo.png
 */
export default function App(props: Props): App<Manifest, State> {
  const figma = new FigmaClient(
    typeof props.accessToken === "string"
      ? props.accessToken
      : props.accessToken.get()!,
  );

  return {
    state: {
      ...props,
      figma,
    },
    manifest,
  };
}

// Re-exports client types for convenience
export * from "./client.ts";
