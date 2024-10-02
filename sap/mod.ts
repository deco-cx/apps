import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { Markdown } from "../decohub/components/Markdown.tsx";
import { API } from "./utils/client/client.ts";

export type AppContext = FnContext<State, Manifest>;

/** @title */
export interface Props {
  /**
   * @title Api url
   */
  apiUrl: string;

  /**
   * @title Base site ID
   */
  baseSiteId: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<API>>;
}

/**
 * @title SAP
 * @description Loaders, actions and workflows for adding SAP Commerce to your website.
 * @category Ecommmerce
 * @logo https://fakestoreapi.com/icons/logo.png
 */
export default function SAP(props: Props): App<Manifest, State> {
  const { apiUrl, baseSiteId } = props;

  const api = createHttpClient<API>({
    base: `${apiUrl}/${baseSiteId}/`,
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  });

  return {
    state: { ...props, api },
    manifest,
  };
}
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "SAP Commerce",
      owner: "deco.cx",
      description:
        "Loaders, actions and workflows for adding SAP Commerce Platform to your website.",
      logo:
        "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
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
