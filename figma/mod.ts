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
 * @name FIGMA
 * @title Figma
 * @description A Deco app to interact with the Figma APIs with strongly typed responses
 * @logo https://ih1.redbubble.net/image.4053581522.4386/raf,360x360,075,t,fafafa:ca443f4786.jpg
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
