import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

const DEFAULT_PROXY_PATHS = [
  "/checkout",
  "/checkout*",
  "/cart",
  "/cart*",
  "/my-account",
  "/my-account/*",
  "/?wc-ajax*",
  "/wp-content",
  "/wp-content/*",
  "/wp-includes",
  "/wp-includes/*",
  "/wc*",
  "/wp*",
];

export interface Props {
  /** @description ex: /p/fale-conosco */
  pagesToProxy?: string[];
}

/**
 * @title WooCommerce Proxy Routes
 */
function loader(
  { pagesToProxy = [] }: Props,
  _req: Request,
  ctx: AppContext,
): Route[] {
  const { publicUrl } = ctx;

  const proxy = [
    ...DEFAULT_PROXY_PATHS,
    ...pagesToProxy,
  ].map((pathTemplate) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: publicUrl,
        redirect: "follow",
        customHeaders: [{
          Host: publicUrl,
        }],
      },
    },
  }));

  return proxy;
}

export default loader;
