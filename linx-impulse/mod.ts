import type {
  App as A,
  AppContext as AC,
  AppMiddlewareContext as AMC,
} from "deco/mod.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { middleware } from "./middleware.ts";
import { ChaordicAPI } from "./utils/chaordic.ts";
import { LinxAPI } from "./utils/client.ts";
import { EventsAPI } from "./utils/events.ts";

export type App = ReturnType<typeof Linx>;
export type AppContext = AC<App>;
export type AppMiddlewareContext = AMC<App>;

/** @title LINX Impulse */
export interface State {
  /**
   * @title Api Key
   */
  apiKey: string;
  /**
   * @title Secret Key
   */
  secretKey?: Secret;
  /**
   * @title Origin URL
   * @description Set the origin URL to authenticate the request if not using the secret key
   */
  origin?: string;
  /**
   * @title Image CDN URL
   * @description e.g.: https://{account}.myvtex.com/
   */
  cdn?: string;
  salesChannel?: string;
  enableMobileSource?: boolean;
}

export const color = 0xFF6A3B;

/**
 * @title Linx Impulse
 * @description Build, manage and deliver B2B, B2C and Marketplace commerce experiences.
 * @category Search
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/linx-impulse/logo.png
 */
export default function Linx({ secretKey, ...props }: State) {
  const headers = new Headers();
  headers.set(
    "x-secret-key",
    typeof secretKey === "string" ? secretKey : secretKey?.get() ?? "",
  );

  const eventsApi = createHttpClient<EventsAPI>({
    base: "https://api.event.linximpulse.net/",
    headers,
  });

  const api = createHttpClient<LinxAPI>({
    base: "http://api.linximpulse.com/",
    headers,
  });

  const chaordicApi = createHttpClient<ChaordicAPI>({
    base: "https://recs.chaordicsystems.com/",
    headers,
  });

  const state = {
    ...props,
    eventsApi,
    api,
    chaordicApi,
    cdn: props.cdn?.replace(/\/$/, "") ?? "", // remove trailing slash
  };

  const app: A<Manifest, typeof state> = { manifest, state, middleware };

  return app;
}
