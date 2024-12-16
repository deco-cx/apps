import { createHttpClient } from "../utils/http.ts";
import type { OpenAPI } from "./utils/openapi/api.openapi.gen.ts";
import { fetchSafe } from "../utils/fetch.ts";
import manifest, { type Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import type { App, AppContext as AC } from "@deco/deco";

interface Props {
  appId: string;
  appKey: string;
  /**
   * @ignore
   */
  platform: "logicommerce";
  /**
   * @ignore
   */
  api: ReturnType<typeof createHttpClient<OpenAPI>>;
}

export type AppContext = AC<ReturnType<typeof Logicommerce>>;

/**
 * @title Logicommerce
 * @description Loaders, actions and workflows for adding Logicommerce to your website.
 * @category Ecommerce
 */
export default function Logicommerce(
  { appId, appKey }: Props,
): App<Manifest, Props> {
  const headers = new Headers();
  headers.set("X-App-id", appId);
  headers.set("X-App-key", appKey);

  const api = createHttpClient<OpenAPI>({
    base: "https://api.logicommerce.com",
    headers,
    fetcher: fetchSafe,
  });

  return { manifest, state: { api, appId, appKey, platform: "logicommerce" } };
}

export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Logicommerce",
      owner: "deco.cx",
      description:
        "Loaders, actions and workflows for adding Wap Commerce Platform to your website.",
      images: [
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/235b17e1-6f7a-4077-98cf-dad53ef075e5/2.Home-Galeria-de-topicos-principais-575x455px.jpg",
      ],
      tabs: [],
    },
  };
};
