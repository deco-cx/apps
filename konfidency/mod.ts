import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createHttpClient } from "../utils/http.ts";
import type { API } from "./utils/client.ts";

export interface Props {
  customer: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<API>>;
}
/**
 * @title konfidency
 */
export default function App(
  state: State,
): App<Manifest, State> {
  const api = createHttpClient<API>({
    base: `https://reviews-api.konfidency.com.br`,
  });

  return { manifest, state: { ...state, api } };
}

export type AppContext = AC<ReturnType<typeof App>>;
