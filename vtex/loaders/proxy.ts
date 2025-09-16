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

export const VTEX_PATHS_THAT_REQUIRES_SAME_REFERER = ["/no-cache/AviseMe.aspx"];

const decoSiteMapUrl = "/sitemap/deco.xml";

const buildProxyRoutes = (
  {
    publicUrl,
    extraPaths,
    includeSiteMap,
    includePathToDecoSitemap,
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap,
    includeScriptsToHead,
    includeScriptsToBody,
  }: {
    publicUrl?: string;
    extraPaths: string[];
    includeSiteMap?: string[];
    includePathToDecoSitemap?: string[];
    generateDecoSiteMap?: boolean;
    excludePathsFromDecoSiteMap: string[];
    includeScriptsToHead?: {
      includes?: Script[];
    };
    includeScriptsToBody?: {
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

    const routeFromPath = (pathTemplate: string): Route => {
      const handlerValue = {
        __resolveType: "website/handlers/proxy.ts",
        url: urlToProxy,
        host: hostToUse,
        includeScriptsToHead,
        includeScriptsToBody,
        removeDirtyCookies: true,
        pathsThatRequireSameReferer: VTEX_PATHS_THAT_REQUIRES_SAME_REFERER,
      };

      return ({
        pathTemplate,
        handler: {
          value: handlerValue,
        },
      });
    };
    const routesFromPaths = [...PATHS_TO_PROXY, ...extraPaths].map(
      routeFromPath,
    );

    const [include, routes] = generateDecoSiteMap
      ? [[...(includeSiteMap ?? []), decoSiteMapUrl], [{
        pathTemplate: decoSiteMapUrl,
        handler: {
          value: {
            excludePaths: excludePathsFromDecoSiteMap,
            includePaths: includePathToDecoSitemap,
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
   * @title Paths to include in the deco sitemap
   */
  includePathToDecoSitemap?: string[];
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
  /**
   * @title Scripts to include on Html body
   */
  includeScriptsToBody?: {
    includes?: Script[];
  };
}

/**
 * @title VTEX Proxy Routes
 * @description Proxy routes to VTEX, commonly used for my account, checkout, etc.
 */
function loader(
  {
    extraPathsToProxy = [],
    includeSiteMap = [],
    includePathToDecoSitemap = [],
    generateDecoSiteMap = true,
    excludePathsFromDecoSiteMap = [],
    includeScriptsToHead = { includes: [] },
    includeScriptsToBody = { includes: [] },
  }: Props,
  _req: Request,
  ctx: AppContext,
): Route[] {
  return buildProxyRoutes({
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap,
    includeSiteMap,
    includePathToDecoSitemap,
    publicUrl: ctx.publicUrl,
    extraPaths: extraPathsToProxy,
    includeScriptsToHead,
    includeScriptsToBody,
  });
}

export default loader;
