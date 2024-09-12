import { Markdown } from "../decohub/components/Markdown.tsx";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { EmailJSApi } from "./utils/client.ts";
import { type App, type AppContext as AC } from "@deco/deco";
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
  { accessToken, service_id, user_id }: State,
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
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "EmailJS",
      owner: "deco.cx",
      description:
        "EmailJS integrates easily with popular email services like Gmail and Outlook, offering features to enhance email functionality.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/emailjs/logo.png",
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
