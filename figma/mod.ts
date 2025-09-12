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
  figma: FigmaClient | null;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @appName figma
 * @title Figma
 * @description Fetch structured design data directly from your Figma files.
 * @logo https://assets.decocache.com/mcp/eb714f8a-404b-4b8e-bfc4-f3ce5bde6f51/Figma.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const figma = props.accessToken
    ? new FigmaClient(
      typeof props.accessToken === "string"
        ? props.accessToken
        : props.accessToken.get()!,
    )
    : null;

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
