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
      Accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cookie":
        "JSESSIONID=7386EA2FC0F9EF7581F736851090A9D.api-78ccdc6899-v8bfk; ROUTE=.api-85c46fdbcb-xtvc2; _abck=C38C0F52396B7A403E5A469B43D38CBE~-1~YAAQlpSuyNFYkQ2SAQAAnlMLEQwjPSJBajHurN1YzGmJLWIq/mv/ar/fxAJgi2Rd+fqU+DQqw6+c6ajfGfUTIYVWO9LSYIW3triwKgeWwzuLCuVxV9+1EmYHFAYUcJkd7Kun3hkadjekIVLGP5I9uWivpZ104mx7Rp+AjM1RoWoQ9y8TFUJsVrJtgR6wDCvDIdZa36KPwOLWH2gqIpqXia4kyg4szVKFwCAllMJ0CI3/HJzqirhBk2taxtit9fHFCVEPtpTiXPkLHFMEngquQF+N4ELGXAukJ2Jh32Fj3bp1LtNHvAojTFUGMJc5wqnsRHksWRkMCTlZ6vEIvV3K6C5tqzGWyZk/N2lkGEBNmJNONLboSCPc/Hqvvi5UFXvaWLUc5pmyjDKSZZA+D3Q=~-1~-1~-1; _dd_s=logs=1&id=581758a9-387a-47e2-8d01-0fabddb1b64b&created=1727111219844&expire=9727112193338",
      priority: "u=0, i",
      "sec-ch-ua":
        '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "macOS",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
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
