import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { previewFromMarkdown } from "../utils/preview.ts";
import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import type { Secret } from "../website/loaders/secret.ts";
import type { EmailJSApi } from "./utils/client.ts";

export interface Props {
  /**
   * @description Service ID of the service through which the email should be sent. Reserved keyword default_service is supported, and should be used to use the default service, which can be set and changed via EmailJS dashboard.
   */
  service_id: string;
  user_id: string;
  accessToken: Secret;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<EmailJSApi>>;
}

/**
 * @title EmailJS
 * @description EmailJS integrates easily with popular email services like Gmail and Outlook, offering features to enhance email functionality.
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/emailjs/logo.png
 */
export default function App(
  {
    accessToken,
    service_id,
    user_id,
  }: State,
): App<Manifest, State> {
  const api = createHttpClient<EmailJSApi>({
    base: "https://api.emailjs.com/api/v1.0",
    fetcher: fetchSafe,
    headers: new Headers({
      "Content-Type": "application/json",
      "Accept": "application/json",
    }),
  });

  const state = {
    accessToken,
    service_id,
    user_id,
    api,
  };

  const app: App<Manifest, typeof state> = {
    state,
    manifest,
  };

  return app;
}

export type AppContext = AC<ReturnType<typeof App>>;

export const preview = previewFromMarkdown(
  new URL("./README.md", import.meta.url),
);
