import { type App, type FnContext } from "@deco/deco";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  /**
   * @title HubSpot API Key / Access Token
   * @description Your HubSpot Private App Access Token or OAuth Access Token
   */
  apiKey?: string;

  /**
   * @title OAuth Client ID
   * @description Required for OAuth flow (App's Client ID)
   */
  clientId?: string;

  /**
   * @title OAuth Client Secret
   * @description Required for OAuth flow
   */
  clientSecret?: Secret;

  /**
   * @title OAuth Redirect URI
   * @description Required for OAuth flow
   */
  redirectUri?: string;

  /**
   * @title HubSpot Portal ID
   * @description Your HubSpot Portal/Hub ID
   */
  portalId?: string;
}

export interface State extends Props {
  api: {
    baseUrl: string;
    headers: Record<string, string>;
  };
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @title HubSpot
 * @appName hubspot
 * @description Integrate with HubSpot CRM, Marketing, and other APIs
 * @category CRM
 * @logo https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png
 */
export default function HubSpotApp(state: Props): App<Manifest, State> {
  const { apiKey } = state;

  if (!apiKey) {
    throw new Error(
      "API Key is required",
    );
  }

  const api = {
    baseUrl: "https://api.hubapi.com",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    },
  };

  const appState: State = {
    ...state,
    api,
  };

  return {
    state: appState,
    manifest,
  };
}
