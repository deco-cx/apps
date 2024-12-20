import { createHttpClient } from "../utils/http.ts";
import type { OpenAPI } from "./utils/openapi/api.openapi.gen.ts";
import { fetchSafe } from "../utils/fetch.ts";
import manifest, { type Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import type {
  App,
  AppContext as AC,
  AppMiddlewareContext as AMC,
} from "@deco/deco";
import { middleware } from "./middleware.ts";

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
export type AppMiddlewareContext = AMC<ReturnType<typeof Logicommerce>>;

export const color = 0x4091a5;

/**
 * @title Logicommerce
 * @description Loaders, actions and workflows for adding Logicommerce to your website.
 * @logo https://raw.githubusercontent.com/deco-cx/apps/refs/heads/feat--logicommerce/logicommerce/logo.png
 * @category Ecommerce
 */
export default function Logicommerce(
  { appId, appKey }: Props,
): App<Manifest, Props> {
  const headers = new Headers();
  headers.set("ip", "127.0.0.1");

  const api = createHttpClient<OpenAPI>({
    base: "https://api-studio.logicommerce.cloud",
    headers,
    fetcher: fetchSafe,
  });

  return {
    manifest,
    state: { api, appId, appKey, platform: "logicommerce" },
    middleware,
  };
}

export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Logicommerce",
      owner: "deco.cx",
      description:
        "Loaders, actions and workflows for adding Wap Commerce Platform to your website.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/refs/heads/feat--logicommerce/logicommerce/logo.png",
      images: [
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/235b17e1-6f7a-4077-98cf-dad53ef075e5/2.Home-Galeria-de-topicos-principais-575x455px.jpg",
      ],
      tabs: [],
    },
  };
};
