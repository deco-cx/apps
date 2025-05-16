import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { WhatsAppClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title WhatsApp Phone Number ID
   * @description The ID of your WhatsApp business phone number
   */
  phoneNumberId: string;

  /**
   * @title Meta App Access Token
   * @description The access token generated in the App Dashboard > WhatsApp > API Setup
   */
  accessToken: string | Secret;

  /**
   * @title API Version
   * @description Meta Graph API version to use
   * @default v22.0
   */
  apiVersion?: string;
}

export interface State {
  phoneNumberId: string;
  apiVersion: string;
  api: ReturnType<typeof createHttpClient<WhatsAppClient>>;
}

/**
 * @name WhatsApp
 * @description Send and receive WhatsApp messages using the official Meta Cloud API
 * @category Communication
 * @logo https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { phoneNumberId, accessToken, apiVersion = "v22.0" } = props;

  const accessTokenValue = typeof accessToken === "string"
    ? accessToken
    : accessToken?.get?.() ?? "";

  const api = createHttpClient<WhatsAppClient>({
    base: `https://graph.facebook.com/${apiVersion}`,
    headers: new Headers({
      "Authorization": `Bearer ${accessTokenValue}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state: State = {
    phoneNumberId,
    apiVersion,
    api,
  };

  return {
    state,
    manifest,
  };
}

export * from "./client.ts";
