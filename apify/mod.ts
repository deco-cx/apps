import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { Secret } from "../website/loaders/secret.ts";
import { ApifyClient } from "./utils/client.ts";
import { APIFY_API_BASE_URL, APIFY_ERROR_MESSAGES } from "./utils/constant.ts";
import {
  createErrorHandler,
  ErrorHandler,
} from "../mcp/utils/errorHandling.ts";

export interface Props {
  /**
   * @title Apify API Token
   * @description Your Apify API token. Get it from https://console.apify.com/account/integrations
   */
  token: string | Secret;
}

export interface State extends Omit<Props, "token"> {
  api: ReturnType<typeof createHttpClient<ApifyClient>>;
  errorHandler: ErrorHandler;
  token: string;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @title Apify
 * @appName apify
 * @description Automate scraping and browser workflows with prebuilt actors.
 * @category Automation
 * @logo https://assets.decocache.com/mcp/4eda8c60-503f-4001-9edb-89de961ab7f0/Apify.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const { token } = props;

  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<ApifyClient>({
    base: APIFY_API_BASE_URL,
    headers: new Headers({
      "Authorization": `Bearer ${stringToken}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const errorHandler = createErrorHandler({
    errorMessages: APIFY_ERROR_MESSAGES,
    defaultErrorMessage: "Apify operation failed",
  });

  const state: State = {
    api,
    errorHandler,
    token: stringToken,
  };

  return {
    state,
    manifest,
  };
}
