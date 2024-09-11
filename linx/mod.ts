import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client.ts";
import { Secret } from "../website/loaders/secret.ts";
import { LayerAPI } from "./utils/layer.ts";
import { Markdown } from "../decohub/components/Markdown.tsx";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type AppContext as AC } from "@deco/deco";
export type AppContext = AC<ReturnType<typeof App>>;
/** @title LINX */
export interface State {
  /**
   * @title LINX Account name
   * @default deco
   */
  account: string;
  /**
   * @title Image CDN URL
   * @description e.g.: https://{account}.cloudfront.net/
   */
  cdn: string;
  /**
   * @title Linx integration token
   * @description user:password of a Linx integration account encoded in base64
   */
  integrationToken: Secret;
}
export const color = 0xFF6A3B;
/**
 *  IMPORTANT: This app needs the DECO_PROXY_DOMAIN=linx.decocache.com
 *  environment variable to work properly.
 */
/**
 * @title Linx
 * @description Loaders, actions and workflows for adding Linx Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/linx/logo.png
 */
export default function App({ account, cdn, integrationToken }: State) {
  const token = integrationToken.get();
  const headers = new Headers({
    "Accept": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    "Authorization": `Basic ${token}`,
    "x-external-service": "deco",
  });
  const api = createHttpClient<API>({
    base: `https://${account}.core.dcg.com.br/`,
    headers,
  });
  const layer = createHttpClient<LayerAPI>({
    base: `https://${account}.layer.core.dcg.com.br/`,
    headers,
  });
  const state = { cdn, api, layer, account };
  const app: App<Manifest, typeof state> = { manifest, state };
  return app;
}
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "Linx",
      owner: "deco.cx",
      description:
        "Loaders, actions and workflows for adding Linx Commerce Platform to your website.",
      logo: "https://raw.githubusercontent.com/deco-cx/apps/main/linx/logo.png",
      images: [
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/6a71271e-6298-45c9-be8d-f226f7e5a4f5/linx.webp",
      ],
      tabs: [
        {
          title: "About",
          content: markdownContent(),
        },
      ],
    },
  };
};
