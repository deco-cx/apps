import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { GoogleAuthClient, GoogleSlidesClient } from "./utils/client.ts";
import { fetchSafe } from "../utils/fetch.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  accessToken?: string | Secret;

  auth: {
    clientId: string;
    clientSecret: Secret;
    redirectUri: string;
  };
}
export interface State extends Props {
  clientAuth: ReturnType<typeof createHttpClient<GoogleAuthClient>>;
  clientSlides: ReturnType<typeof createHttpClient<GoogleSlidesClient>>;
}

/**
 * @title Google Slides
 * @description Create and manage Google Slides presentations
 * @category Content Management
 * @logo https://www.gstatic.com/images/branding/product/1x/slides_48dp.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { auth } = props;

  const _clientSecret = typeof auth.clientSecret === "string"
    ? auth.clientSecret
    : auth.clientSecret?.get?.() ?? "";

  const clientAuth = createHttpClient<GoogleAuthClient>({
    base: "https://oauth2.googleapis.com",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    }),
    fetcher: fetchSafe,
  });

  const clientSlides = createHttpClient<GoogleSlidesClient>({
    base: "https://slides.googleapis.com",
    headers: new Headers({
      "Accept": "application/json",
    }),
    fetcher: fetchSafe,
  });
  const state = {
    ...props,
    clientAuth,
    auth: {
      clientId: props.auth.clientId,
      clientSecret: props.auth.clientSecret,
      redirectUri: props.auth.redirectUri,
    },
    clientSlides,
  };

  return {
    state,
    manifest,
  };
}
