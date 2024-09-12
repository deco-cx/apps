import { Markdown } from "../decohub/components/Markdown.tsx";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client.ts";
import {
  type App as A,
  type AppContext as AC,
  type ManifestOf,
} from "@deco/deco";
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
  const headers = new Headers();
  headers.set("Authorization", `Basic ${btoa(`anystring:${apiKey.get()}`)}`);
  const api = createHttpClient<API>({
    base: `https://${serverPrefix}.api.mailchimp.com`,
    headers,
  });
  const state = { api };
  const app: A<Manifest, typeof state> = {
    state,
    manifest,
  };
  return app;
}
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "Mailchimp",
      owner: "deco.cx",
      description:
        "Mailchimp is an email and marketing automations platform for growing businesses.",
      logo:
        "https://s3.amazonaws.com/www-inside-design/uploads/2018/10/mailchimp-sq.jpg",
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
