import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { TursoClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Database URL
   * @description URL of your Turso database (e.g., https://your-db-org.turso.io)
   */
  databaseUrl: string;

  /**
   * @title Authorization Token
   * @description Auth token for accessing your Turso database
   */
  token?: string | Secret;
}

// App state with the initialized API client
export interface State {
  api: ReturnType<typeof createHttpClient<TursoClient>>;
  databaseUrl: string;
}

/**
 * @title TursoDB
 * @appName turso-db
 * @description Run fast SQL queries on distributed SQLite databases.
 * @category Databases
 * @logo https://assets.decocache.com/mcp/3ebbc3e0-59d3-41b3-8cbc-3649b7ba8052/Turso-DB.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, databaseUrl } = props;

  // Extract token value safely
  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  // Create HTTP client for Turso API
  const api = createHttpClient<TursoClient>({
    base: databaseUrl,
    headers: new Headers({
      "Authorization": `Bearer ${stringToken}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  // App state that will be available in all function contexts
  const state = {
    api,
    databaseUrl,
  };

  return {
    state,
    manifest,
  };
}
