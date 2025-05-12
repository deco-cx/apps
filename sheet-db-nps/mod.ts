import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import type { SheetDbNpsClient } from "./client.ts";

export interface Props {
  /**
   * @title SheetDB API Base URL
   * @description The full SheetDB API endpoint, e.g. https://sheetdb.io/api/v1/22yccu8lrc3ua
   */
  baseUrl: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<SheetDbNpsClient>>;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @name SheetDB NPS
 * @title SheetDB NPS
 * @description Exposes NPS data from a SheetDB spreadsheet.
 * @logo https://sheetdb.io/favicon.ico
 * @version 1.0.0
 */
export default function App(props: Props): App<Manifest, State> {
  const api = createHttpClient<SheetDbNpsClient>({
    base: props.baseUrl,
    fetcher: fetchSafe,
  });
  return {
    state: { ...props, api },
    manifest,
  };
} 