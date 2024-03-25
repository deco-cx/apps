import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";
import { Script } from "../../website/types.ts";

const PATHS_TO_PROXY = [
  "/checkout",
  "/checkout/*",
  "/account",
  "/account/",
  "/account/*",
];
const decoSiteMapUrl = "/sitemap/deco.xml";

const buildProxyRoutes = (
  {
    publicUrl,
    extraPaths,
    includeSiteMap,
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap,
    includeScriptsToHead,
  }: {
    publicUrl?: string;
    extraPaths: string[];
    includeSiteMap?: string[];
    generateDecoSiteMap?: boolean;
    excludePathsFromDecoSiteMap: string[];
    includeScriptsToHead?: {
      includes?: Script[];
    };
  },
) => {
  if (!publicUrl) {
    return [];
  }

  try {
    const hostname = (new URL(
      publicUrl?.startsWith("http") ? publicUrl : `https://${publicUrl}`,
    )).hostname;

    // Rejects TLD mystore.com
    if (!hostname || hostname.split(".").length <= 2) {
      throw new Error(`Invalid hostname from '${publicUrl}'`);
    }

    const urlToProxy = `https://${hostname}`;
    const hostToUse = hostname;
    const routeFromPath = (pathTemplate: string): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "website/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
          redirect: "follow",
          includeScriptsToHead,
        },
      },
    });
    const routesFromPaths = [...PATHS_TO_PROXY, ...extraPaths].map(
      routeFromPath,
    );

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

    return [
      ...routes,
      {
        pathTemplate: "/sitemap.xml",
        handler: {
          value: {
            include,
            __resolveType: "nuvemshop/handlers/sitemap.ts",
          },
        },
      },
      {
        pathTemplate: "/sitemap*",
        handler: {
          value: {
            __resolveType: "nuvemshop/handlers/sitemap.ts",
          },
        },
      },
      ...routesFromPaths,
    ];
  } catch (e) {
    console.log("Error parsing publicUrl from Nuvemshop");
    console.error(e);
    return [];
  }
};

export interface Props {
  extraPathsToProxy?: string[];
  /**
   * @title Other site maps to include
   */
  includeSiteMap?: string[];
  /**
   * @title If deco site map should be exposed at /deco-sitemap.xml
   */
  generateDecoSiteMap?: boolean;
  /**
   * @title Exclude paths from /deco-sitemap.xml
   */
  excludePathsFromDecoSiteMap?: string[];
  /**
   * @title Scripts to include on Html head
   */
  includeScriptsToHead?: {
    includes?: Script[];
  };
}

/**
 * @title Nuvemshop Proxy Routes
 */
function loader(
  {
    extraPathsToProxy = [],
    includeSiteMap = [],
    generateDecoSiteMap = true,
    excludePathsFromDecoSiteMap = [],
    includeScriptsToHead = { includes: [] },
  }: Props,
  _req: Request,
  ctx: AppContext,
): Route[] {
  return buildProxyRoutes({
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap,
    includeSiteMap,
    publicUrl: ctx.publicUrl,
    extraPaths: extraPathsToProxy,
    includeScriptsToHead,
  });
}

export default loader;
