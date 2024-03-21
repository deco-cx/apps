import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";
import { Script } from "../../website/types.ts";

const PATHS_TO_PROXY = [
  "/account",
  "/checkout",
  "/checkout/*",
  "/files/*",
  "/assets/*",
  "/arquivos/*",
  "/account/*",
  "/login",
  "/no-cache/*",
  "/api/*",
  "/logout",
  "/_secure/account",
  "/XMLData/*",
  "/_v/*",
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

    // Rejects TLD mystore.com, which VTEX doesn't support it carrefour.com.br / CNAME
    if (!hostname || hostname.split(".").length <= 2) {
      throw new Error(`Invalid hostname from '${publicUrl}'`);
    }

    // TODO @lucis: Fix the proxy, MITM

    // const urlToProxy = `https://${hostname}.cdn.vtex.com`;
    const urlToProxy = `https://${hostname}`;
    const hostToUse = hostname;

    const routeFromPath = (pathTemplate: string): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "website/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
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
            __resolveType: "vtex/handlers/sitemap.ts",
          },
        },
      },
      {
        pathTemplate: "/sitemap/*",
        handler: {
          value: {
            __resolveType: "vtex/handlers/sitemap.ts",
          },
        },
      },
      ...routesFromPaths,
    ];
  } catch (e) {
    console.log("Error parsing publicUrl from configVTEX");
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
 * @title VTEX Proxy Routes
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
