import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { BrowserlessClient } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

export interface Props {
  /**
   * @title Browserless API Key
   * @description Authentication key for the Browserless API.
   * @format password
   */
  token?: string | Secret;
}

export interface State extends Props {
  browserless: BrowserlessClient;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @title Browserless
 * @name Browserless
 * @description Browserless provides headless browser APIs for content, screenshots, PDFs, and more
 * @logo https://docs.browserless.io/img/browserless-logo.svg
 * @version 1.0.0
 */
export default function App(props: Props): App<Manifest, State> {
  const key = props.token
    ? (typeof props.token === "string" ? props.token : props.token.get())
    : undefined;

  const browserless = new BrowserlessClient(key || undefined);

  return {
    state: {
      ...props,
      browserless,
    },
    manifest,
  };
}

// Re-export types from client for convenience
export * from "./client.ts";
