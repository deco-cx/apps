import type { App, FnContext } from "@deco/deco";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<Props, Manifest>;

export interface Props {
  /**
   * @title Roblox API Key
   * @description The API key for the Roblox API
   */
  robloxApiKey: Secret;

  /**
   * @title Roblox Cookie
   * @description The cookie for the Roblox API
   */
  robloxCookie: Secret;
}


export default function App(props: Props): App<Manifest, Props> {
  return {
    state: props,
    manifest,
  };
}
