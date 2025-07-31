import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Client } from "./utils/client.ts";
import { BART_URL } from "./utils/constants.ts";
import { createHttpClient } from "../utils/http.ts";
import { Secret } from "../website/loaders/secret.ts";
import { fetchSafe } from "../utils/fetch.ts";
import {
  createErrorHandler,
  ErrorHandler,
} from "../mcp/utils/errorHandling.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API token
   * @description The token to access the Barte API
   */
  token?: Secret | string;
}

export interface State extends Omit<Props, "token"> {
  api: ReturnType<typeof createHttpClient<Client>>;
  errorHandler: ErrorHandler;
}

/**
 * @title Barte
 * @appName barte
 * @description Centralize and structure your product data with Barte’s catalog tools.
 * @category Payment Platform
 * @logo https://assets.decocache.com/mcp/2b4f178a-73be-44c9-a342-4d4c0e9bcad4/Barte.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { token } = props;

  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<Client>({
    base: BART_URL,
    headers: new Headers({ "X-Token-Api": `${stringToken}` }),
    fetcher: fetchSafe,
  });

  const errorHandler = createErrorHandler({
    errorMessages: {},
    defaultErrorMessage: "Barte operation failed",
  });

  const state = { ...props, api, errorHandler };

  return {
    state,
    manifest,
  };
}
