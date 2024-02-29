import type { App as A, AppContext as AC, ManifestOf } from "deco/mod.ts";
import { fetchSafe } from "./utils/fetchSafe.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client.ts";
import { Secret } from "../website/loaders/secret.ts";

export type App = ReturnType<typeof Mailchimp>;
export type AppContext = AC<App>;
export type AppManifest = ManifestOf<App>;

export interface Props {
  apiKey: Secret;
  /**
   * @description e.g: us1, us18, us21, ...etc
   */
  serverPrefix: string;
}
/**
 * @title Mailchimp
 */
export default function Mailchimp(props: Props) {
  const { serverPrefix, apiKey } = props;
  const key = typeof apiKey === "string" ? apiKey : apiKey.get();

  const headers = new Headers();
  headers.set("Authorization", `Basic ${btoa(`anystring:${key}`)}`);

  const api = createHttpClient<API>({
    base: `https://${serverPrefix}.api.mailchimp.com`,
    fetcher: fetchSafe,
    headers,
  });

  const state = { api };

  const app: A<Manifest, typeof state> = {
    state,
    manifest,
  };

  return app;
}
