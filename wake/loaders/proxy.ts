import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

const PATHS_TO_PROXY = [
  ["/checkout", "/checkout"],
  ["/Fechamento"],
  ["/Fechamento/*"],
  ["/Login"],
  ["/Login/*"],
  ["/login/*"],
  ["/Login/Authenticate"],
  ["/Carrinho/*"],
  ["/api/*"],
  ["/MinhaConta"],
  ["/MinhaConta/*"],
];

const decoSiteMapUrl = "/sitemap/deco.xml";

export interface Props {
  extraPathsToProxy?: string[];
  /**
   * @title If deco site map should be exposed at /deco-sitemap.xml
   */
  generateDecoSiteMap?: boolean;
  /**
   * @title Exclude paths from /deco-sitemap.xml
   */
  excludePathsFromDecoSiteMap?: string[];
  /**
   * @title Other site maps to include
   */
  includeSiteMap?: string[];
}

/**
 * @title Wake Proxy Routes
 */
function loader(
  props: Props,
  _req: Request,
  { checkoutUrl }: AppContext,
): Route[] {
  const {
    generateDecoSiteMap = true,
    excludePathsFromDecoSiteMap = [],
    includeSiteMap,
    extraPathsToProxy = [],
  } = props as Props;

  const checkout = [...PATHS_TO_PROXY, ...extraPathsToProxy].map((
    [pathTemplate, basePath],
  ) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: checkoutUrl,
        basePath,
        customHeaders: [{
          Host: checkoutUrl,
        }],
      },
    },
  }));

  const [include, routes] = generateDecoSiteMap
    ? [[...(includeSiteMap ?? []), decoSiteMapUrl], [{
      pathTemplate: decoSiteMapUrl,
      handler: {
        value: {
          excludePaths: excludePathsFromDecoSiteMap,
          __resolveType: "website/handlers/sitemap.ts",
        },
      },
    }]]
    : [includeSiteMap, []];

  // TODO: include is not working, because wake return all urls directly at /Sitemap.xml
  const sitemap = {
    pathTemplate: "/Sitemap.xml",
    handler: {
      value: {
        __resolveType: "wake/handlers/sitemap.ts",
        include,
        customHeaders: [{
          Host: checkoutUrl,
        }],
      },
    },
  };

  return [...routes, ...checkout, sitemap];
}

export default loader;
