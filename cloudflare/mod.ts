import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { CloudflareClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Account ID
   * @description Your Cloudflare account ID
   */
  accountId: string;

  /**
   * @title API Token
   * @description Your Cloudflare API token with the appropriate permissions
   */
  apiToken?: string | Secret;

  /**
   * @title Email (Alternative Auth)
   * @description Your Cloudflare account email, used with API key authentication
   */
  email?: string;

  /**
   * @title API Key (Alternative Auth)
   * @description Your Cloudflare API key, used with email authentication
   */
  apiKey?: string | Secret;
}

export interface State {
  accountId: string;
  api: ReturnType<typeof createHttpClient<CloudflareClient>>;
}

/**
 * @name Cloudflare
 * @description Integration with Cloudflare API to manage Workers and more
 * @category Developer Tools
 * @logo https://images.seeklogo.com/logo-png/29/2/cloudflare-logo-png_seeklogo-294312.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { accountId, apiToken, email, apiKey } = props;

  // Handle different authentication methods
  const headers = new Headers();

  if (apiToken) {
    const token = typeof apiToken === "string"
      ? apiToken
      : apiToken.get?.() ?? "";
    headers.set("Authorization", `Bearer ${token}`);
  } else if (email && apiKey) {
    headers.set("X-Auth-Email", email);
    const key = typeof apiKey === "string" ? apiKey : apiKey.get?.() ?? "";
    headers.set("X-Auth-Key", key);
  } else {
    console.warn("Cloudflare app: No authentication method provided");
  }

  // Create API client
  const api = createHttpClient<CloudflareClient>({
    base: "https://api.cloudflare.com/client/v4",
    headers,
    fetcher: fetchSafe,
  });

  // Define app state
  const state = {
    accountId,
    api,
  };

  return {
    state,
    manifest,
  };
}
