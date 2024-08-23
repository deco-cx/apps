import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";
import { Script } from "../../website/types.ts";
import { linxProxyFailingHeaders } from "../utils/headers.ts";

const PATHS_TO_PROXY = [
  "/login",
  "/painel-do-cliente",
  "/carrinho",
].flatMap((path) => [path, `${path}/`, `${path}/*`]);

const decoSiteMapUrl = "/sitemap/deco.xml";

const buildProxyRoutes = (
  {
    ctx: { account },
    extraPaths,
    includeSiteMap,
    generateDecoSiteMap,
    includeScriptsToHead,
  }: {
    ctx: AppContext;
    extraPaths: string[];
    includeSiteMap?: string[];
    generateDecoSiteMap?: boolean;
    includeScriptsToHead?: {
      includes?: Script[];
    };
  },
) => {
  const publicUrl = new URL(`https://${account}.core.dcg.com.br`);

  try {
    const hostname = publicUrl.hostname;

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
          includeScriptsToHead,
          excludeHeaders: linxProxyFailingHeaders,
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
            __resolveType: "linx/handlers/sitemap.ts",
          },
        },
      },
      {
        pathTemplate: "/sitemap*",
        handler: {
          value: {
            __resolveType: "linx/handlers/sitemap.ts",
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
   * @title Scripts to include on Html head
   */
  includeScriptsToHead?: {
    includes?: Script[];
  };
}

/**
 * @title Linx Proxy Routes
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
  const routes = buildProxyRoutes({
    generateDecoSiteMap,
    includeSiteMap,
    extraPaths: extraPathsToProxy,
    includeScriptsToHead,
    ctx,
  });

  return routes;
}

export default loader;
