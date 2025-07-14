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
 * @description Fetch structured design data directly from your Figma files.
 * @logo https://assets.decocache.com/mcp/eb714f8a-404b-4b8e-bfc4-f3ce5bde6f51/Figma.svg
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
