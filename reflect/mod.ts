import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts"; // Will be generated
import { ReflectClient } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

export interface Props {
  /**
   * @title Reflect OAuth Token
   * @description OAuth Access Token for the Reflect API. Create a client and get access token at https://reflect.app/developer/oauth.
   * @format password
   */
  authToken: string | Secret;
}

export interface State extends Props {
  reflect: ReflectClient;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @appName reflect
 * @title Reflect
 * @description Capture and organize your thoughts in a connected notes app.
 * @logo https://assets.decocache.com/mcp/dede3890-36bb-4cd4-a574-2c10fed1fb85/Reflect.svg
 * @version 1.0.0
 */
export default function App(props: Props): App<Manifest, State> {
  const token = typeof props.authToken === "string"
    ? props.authToken
    : props.authToken.get();
  if (!token) {
    throw new Error(
      "Reflect OAuth Token is required. Please provide it in the site configuration.",
    );
  }
  const reflect = new ReflectClient(token);

  return {
    state: {
      ...props,
      reflect,
    },
    manifest,
  };
}

// Re-export types from client for convenience
export * from "./client.ts";
