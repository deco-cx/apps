import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts"; // Assuming manifest.gen.ts exists or will be created
import { GrainClient } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

export interface Props {
  /**
   * @title Grain Auth Token
   * @description Authentication token for the Grain API. Can be a Personal Access Token or OAuth2 Access Token.
   * @format password
   */
  authToken: string | Secret;
}

export interface State extends Props {
  grain: GrainClient;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @name Grain
 * @title Grain
 * @description grain.com is an AI Notetaker for your meeting
 * @logo https://images.ctfassets.net/9haz2glq4wt0/36OjNsjfRZpaR1QtYtPucU/391ae8f9716fa000508b11583fcc9ebb/Grain_AI_Logo.png
 * @version 1.0.0
 */
export default function App(props: Props): App<Manifest, State> {
  const token = typeof props.authToken === "string"
    ? props.authToken
    : props.authToken.get();
  if (!token) {
    throw new Error(
      "Grain Auth Token is required. Please provide it in the site configuration.",
    );
  }
  const grain = new GrainClient(token);

  return {
    state: {
      ...props,
      grain,
    },
    manifest,
  };
}

// Re-export types from client for convenience
export * from "./client.ts";
