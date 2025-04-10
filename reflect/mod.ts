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
 * @name Reflect
 * @title Reflect
 * @description Reflect is an end-to-end encrypted note-taking app for capturing, organizing, and connecting your ideas.
 * @logo https://yt3.googleusercontent.com/ltMW3jdIUgobZAOc9MCaKJqzcfze2gREUPKxx3nyQ63C7dzXCeB3g1TnfbuI1rlZeZxHkVjJI8Y=s900-c-k-c0x00ffffff-no-rj
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
