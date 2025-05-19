import { createHttpClient } from "../../utils/http.ts";
import { fetchSafe } from "../../utils/fetch.ts";
import { State } from "../mod.ts";

/**
 * Creates a typed client for Sienge REST API endpoints
 */
export function createRestClient<T>(state: State) {
  return createHttpClient<T>({
    base: state.baseUrl,
    headers: new Headers({
      "Authorization": state.authHeader,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });
}

/**
 * Creates a typed client for Sienge Bulk Data API endpoints
 */
export function createBulkClient<T>(state: State) {
  return createHttpClient<T>({
    base: state.bulkBaseUrl,
    headers: new Headers({
      "Authorization": state.authHeader,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });
}
