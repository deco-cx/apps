import { Markdown } from "../decohub/components/Markdown.tsx";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { ResendApi } from "./utils/client.ts";
import { type App, type AppContext as AC } from "@deco/deco";
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
export default function App({
  apiKey,
  emailFrom = {
    name: "Contact",
    domain: "<onboarding@resend.dev>",
  },
  emailTo,
  subject = "Contato via app resend",
}: State): App<Manifest, State> {
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
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "Resend",
      owner: "deco.cx",
      description: "App for sending emails using https://resend.com/",
      logo:
        "https://auth.deco.cx/storage/v1/object/public/assets/1/user_content/resend-logo.png",
      images: [],
      tabs: [
        {
          title: "About",
          content: markdownContent(),
        },
      ],
    },
  };
};
