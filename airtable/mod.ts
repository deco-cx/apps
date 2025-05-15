import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts"; // Corrected path
import { fetchSafe } from "../utils/fetch.ts"; // Corrected path
import type { Secret } from "./types.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { AirtableClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Airtable API Key
   * @description The API key for accessing your Airtable account.
   * @format password
   */
  apiKey: Secret | string;

  /**
   * @title Airtable Base URL
   * @description The base URL for the Airtable API.
   * @default https://api.airtable.com
   */
  baseUrl?: string;
}

export interface State {
  api: ReturnType<typeof createHttpClient<AirtableClient>>;
  apiKey: string; // Store the resolved API key
  baseUrl: string;
}

/**
 * @name Airtable
 * @description Connect to Airtable bases and manage records, tables, and fields.
 * @category Productivity
 * @logo https://static-00.iconduck.com/assets.00/airtable-icon-512x428-olxouyvv.png
 */
export default function App(props: Props): App<Manifest, State> {
  const resolvedApiKey = typeof props.apiKey === "string"
    ? props.apiKey
    : props.apiKey.get();
  const resolvedBaseUrl = props.baseUrl || "https://api.airtable.com";

  const api = createHttpClient<AirtableClient>({
    base: resolvedBaseUrl,
    headers: new Headers({
      "Authorization": `Bearer ${resolvedApiKey}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state: State = {
    api,
    apiKey: resolvedApiKey,
    baseUrl: resolvedBaseUrl,
  };

  return {
    state,
    manifest,
  };
}
