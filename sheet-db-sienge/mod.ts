import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SheetDBClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title SheetDB API ID
   * @description The ID for your SheetDB API (e.g., 58f61be4dda40)
   */
  apiId: string;

  /**
   * @title API Key (Optional)
   * @description If your SheetDB API requires authentication
   */
  apiKey?: string | Secret;
}

export interface State {
  apiId: string;
  api: ReturnType<typeof createHttpClient<SheetDBClient>>;
}

/**
 * @name SheetDB Sienge
 * @description Access and manage Sienge data through SheetDB API
 * @category Data Management
 */
export default function App(props: Props): App<Manifest, State> {
  const { apiId, apiKey } = props;

  const apiKeyValue = typeof apiKey === "string" ? apiKey : apiKey?.get?.() ?? "";
  
  const headers = new Headers();
  if (apiKeyValue) {
    headers.set("Authorization", `Bearer ${apiKeyValue}`);
  }

  const api = createHttpClient<SheetDBClient>({
    base: `https://sheetdb.io/api/v1/${apiId}`,
    headers: headers,
    fetcher: fetchSafe,
  });

  const state = { 
    apiId,
    api 
  };

  return {
    state,
    manifest,
  };
} 