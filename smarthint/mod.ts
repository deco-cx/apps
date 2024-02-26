
import type { App, AppContext as AC, AppMiddlewareContext as AMC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createHttpClient } from "../utils/http.ts";
import { OpenAPI } from "./utils/openapi/smarthint.openapi.gen.ts";
import { middleware } from "./middleware.ts";

export type AppMiddlewareContext = AMC<ReturnType<typeof App>>;

export interface Props {
    token: string;
    shcode: string;
};

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<OpenAPI>>;
}

/**
 * @title smarthint
 */
export default function App(
  props: Props,
): App<Manifest, State> {
  const { token } = props
  const api = createHttpClient<OpenAPI>({ headers: new Headers({
    authorization: token,
  }), 
  base: "https://catalog.smarthint.co/api",
})
  return { 
    state: { ...props, api }, 
    middleware,
    manifest, 
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
