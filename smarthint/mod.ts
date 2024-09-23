import { Category } from "../commerce/types.ts";
import { Markdown } from "../decohub/components/Markdown.tsx";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import manifest from "./manifest.gen.ts";
import { OpenAPI } from "./utils/openapi/smarthint.openapi.gen.ts";
import { type App, type AppContext as AC } from "@deco/deco";
export interface State {
  /**
   * @description Your SmartHint Code. Get this information in your Admin Panel. (SH-XXXXX)
   */
  shcode: string;
  /**
   * @description Your SmartHint Cluster. Get this information in your Admin Panel. (vX)
   */
  cluster: string;
  /**
   * @title Public store URL
   * @description Ex: www.mystore.com.br
   */
  publicUrl: string;
  /**
   * @description This prop is required to use SmartHint to category result
   */
  categoryTree?: Category | Category[];
}
/**
 * @title SmartHint
 * @description Smart search and product recommendation to improve your eCommerce customer experience.
 * @category Search
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/smarthint/logo.png
 */
export default function App(props: State) {
  const headers = new Headers();
  headers.set("accept", "application/json");
  headers.set("content-type", "application/json");
  headers.set("Cache-Control", "no-cache");
  const api = createHttpClient<OpenAPI>({
    base: "https://searches.smarthint.co/",
    fetcher: fetchSafe,
    headers: headers,
  });
  const recs = createHttpClient<OpenAPI>({
    base: "https://recs.smarthint.co",
    fetcher: fetchSafe,
    headers: headers,
  });
  const publicUrl = (new URL(
    props.publicUrl?.startsWith("http")
      ? props.publicUrl
      : `https://${props.publicUrl}`,
  )).origin;
  const state = {
    ...props,
    publicUrl,
    api,
    recs,
  };
  return { manifest, state };
}
export type AppContext = AC<ReturnType<typeof App>>;
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "SmartHint",
      owner: "deco.cx",
      description:
        "Smart search and product recommendation to improve your eCommerce customer experience.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/smarthint/logo.png",
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
// TODO fix image path
