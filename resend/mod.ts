import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createHttpClient } from "../utils/http.ts";
import { ResendApi } from "./utils/client.ts";
import { fetchSafe } from "../utils/fetch.ts";
import type { Secret } from "../website/loaders/secret.ts";
import { previewFromMarkdown } from "../utils/preview.ts";

export interface EmailFrom {
  name?: string;
  domain?: string;
}

export interface Props {
  /**@title API KEY Resend  */
  apiKey?: Secret;
  /**
   * @title Sender Options | Default
   */
  emailFrom?: EmailFrom;
  /**
   * @title Receiver | Default
   * @description List of recipients who received the email
   */
  emailTo?: string[];
  /**
   * @title Subject | Default
   */
  subject?: string;
}

export interface State extends Props {
  apiWrite: ReturnType<typeof createHttpClient<ResendApi>>;
}

/**
 * @title Resend
 * @description app for sending emails using https://resend.com/
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/resend/logo.png
 */
export default function App(
  {
    apiKey,
    emailFrom = {
      name: "Contact",
      domain: "<onboarding@resend.dev>",
    },
    emailTo,
    subject = "Contato via app resend",
  }: State,
): App<Manifest, State> {
  if (!apiKey) throw new Error("Missing apiKey for resend");
  const apiKeyToken = typeof apiKey === "string"
    ? apiKey
    : apiKey?.get?.() ?? "";

  const apiWrite = createHttpClient<ResendApi>({
    base: "https://api.resend.com/emails",
    fetcher: fetchSafe,
    headers: new Headers({
      Authorization: `Bearer ${apiKeyToken}`,
      "Content-Type": "application/json",
    }),
  });

  const state = {
    apiKey,
    emailFrom,
    emailTo,
    subject,
    apiWrite,
  };

  const app: App<Manifest, typeof state> = {
    manifest,
    state,
  };
  return app;
}

export type AppContext = AC<ReturnType<typeof App>>;

export const preview = previewFromMarkdown(
  new URL("./README.md", import.meta.url),
);
