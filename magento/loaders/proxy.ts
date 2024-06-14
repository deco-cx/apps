import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

const PATHS_TO_PROXY = [
  "/customer/*",
  "/checkout/*",
  "/checkout",
  "/sales/*",
  "/wishlist",
  "/wishlist/*",
  "/customer/*",
  "/vault/*",
  "/catalogsearch/*",
  "/catalog/*",
];
const decoSiteMapUrl = "/sitemap/deco.xml";

const buildProxyRoutes = ({
  ctx,
  extraPaths,
  includeSiteMap,
  generateDecoSiteMap,
  excludePathsFromDecoSiteMap,
  prodUrl,
}: {
  extraPaths: string[];
  includeSiteMap?: string[];
  generateDecoSiteMap?: boolean;
  ctx: AppContext;
  excludePathsFromDecoSiteMap: string[];
  prodUrl: URL;
}) => {
  const publicUrl = new URL(
    ctx.baseUrl?.startsWith("http") ? ctx.baseUrl : `https://${ctx.baseUrl}`
  );

  try {
    const urlToProxy = publicUrl.href;
    const hostToUse = publicUrl.hostname;

    const routeFromPath = (pathTemplate: string): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "website/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
          customHeaders: [
            {
              key: "x-forwarded-for",
              value: prodUrl.origin,
            },
          ],
        },
      },
    });
    const routesFromPaths = [...PATHS_TO_PROXY, ...extraPaths].map(
      routeFromPath
    );

    const [include, routes] = generateDecoSiteMap
      ? [
          [...(includeSiteMap ?? []), decoSiteMapUrl],
          [
            {
              pathTemplate: decoSiteMapUrl,
              handler: {
                value: {
                  excludePaths: excludePathsFromDecoSiteMap,
                  __resolveType: "website/handlers/sitemap.ts",
                },
              },
            },
          ],
        ]
      : [includeSiteMap, []];

    return [
      ...routes,
      {
        pathTemplate: "/sitemap.xml",
        handler: {
          value: {
            include,
            __resolveType: "magento/handlers/sitemap.ts",
          },
        },
      },
      {
        pathTemplate: "/sitemap/*",
        handler: {
          value: {
            __resolveType: "magento/handlers/sitemap.ts",
          },
        },
      },
      ...routesFromPaths,
    ];
  } catch (e) {
    console.log("Error in Magento Proxies");
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
}

/**
 * @title Magento Proxy Routes
 */
function loader(
  {
    extraPathsToProxy = [],
    includeSiteMap = [],
    generateDecoSiteMap = true,
    excludePathsFromDecoSiteMap = [],
  }: Props,
  req: Request,
  ctx: AppContext
): Route[] {
  const prodUrl = new URL(req.url);
  return buildProxyRoutes({
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap,
    includeSiteMap,
    extraPaths: extraPathsToProxy,
    ctx,
    prodUrl,
  });
}

export default loader;
