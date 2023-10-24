import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";
import { exclusionAndHashScript } from "../../utils/plausible_scripts.ts";

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
    includeScriptsToHead,
  }: {
    publicUrl?: string;
    extraPaths: string[];
    includeSiteMap?: string[];
    generateDecoSiteMap?: boolean;
    includeScriptsToHead?: {
      includes?: string[];
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

    const link1 =
      '<link rel="dns-prefetch" href="https://plausible.io/api/event" />';
    const link2 =
      '<link rel="preconnect" href="https://plausible.io/api/event" crossorigin="anonymous" />';
    const plausibleScript =
      `<script defer data-exclude="/proxy" data-api="https://plausible.io/api/event">${exclusionAndHashScript}</script>`;

    if (typeof includeScriptsToHead === "undefined") {
      includeScriptsToHead = { includes: [] };
    }

    includeScriptsToHead.includes = [
      link1,
      link2,
      plausibleScript,
      ...(includeScriptsToHead?.includes ?? []),
    ];

    const routeFromPath = (pathTemplate: string): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "website/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
          includeScriptsToHead: includeScriptsToHead,
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
   * @title Scripts to include on Html head
   */
  includeScriptsToHead?: {
    includes?: string[];
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
    includeScriptsToHead = { includes: [] },
  }: Props,
  _req: Request,
  ctx: AppContext,
): Route[] {
  return buildProxyRoutes({
    generateDecoSiteMap,
    includeSiteMap,
    publicUrl: ctx.publicUrl,
    extraPaths: extraPathsToProxy,
    includeScriptsToHead,
  });
}

export default loader;
