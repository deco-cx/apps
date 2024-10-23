import algolia from "https://esm.sh/algoliasearch@4.20.0";
import { createFetchRequester } from "npm:@algolia/requester-fetch@4.20.0";
import { Markdown } from "../decohub/components/Markdown.tsx";
import { PreviewContainer } from "../utils/preview.tsx";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { type App, type AppContext as AC } from "@deco/deco";
export type AppContext = AC<ReturnType<typeof App>>;
export interface State {
  /**
   * @title Your Algolia App ID
   * @description https://dashboard.algolia.com/account/api-keys/all
   */
  applicationId: string;
  /**
   * @title Search API Key
   * @description https://dashboard.algolia.com/account/api-keys/all
   * @format password
   */
  searchApiKey: string;
  /**
   * @title Admin API Key
   * @description https://dashboard.algolia.com/account/api-keys/all
   * @format password
   */
  adminApiKey: Secret;
}
/**
 * @title Algolia
 * @description Product search & discovery that increases conversions at scale.
 * @category Search
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/algolia/logo.png
 */
export default function App(props: State) {
  const { applicationId, adminApiKey, searchApiKey } = props;
  if (!adminApiKey) {
    throw new Error("Missing admin API key");
  }
  const stringAdminApiKey = typeof adminApiKey === "string"
    ? adminApiKey
    : adminApiKey?.get?.() ?? "";
  const client = algolia(applicationId, stringAdminApiKey, {
    requester: createFetchRequester(), // Fetch makes it perform mutch better
  });
  const state = { client, applicationId, searchApiKey };
  const app: App<Manifest, typeof state> = {
    manifest: {
      ...manifest,
      actions: {
        ...manifest.actions,
        "algolia/actions/setup.ts": {
          ...manifest.actions["algolia/actions/setup.ts"],
          default: (p, req, ctx) =>
            manifest.actions["algolia/actions/setup.ts"].default(
              { applicationId, adminApiKey: stringAdminApiKey, ...p },
              req,
              ctx,
            ),
        },
      },
    },
    state,
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
      name: "Algolia",
      owner: "deco.cx",
      description:
        "Product search & discovery that increases conversions at scale.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/algolia/logo.png",
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
