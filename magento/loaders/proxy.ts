import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

const PAGE_PATHS_TO_PROXY = [
  "/sales/*",
  "/wishlist",
  "/wishlist/*",
  "/vault/*",
  "/catalogsearch/*",
  "/catalog/*",
];

const ASSETS_PATHS_TO_PROXY = [
  "/static",
  "/static/*",
  "/icon-v2-192x192.png",
  "/icon-v2-256x256.png",
  "/icon-v2-384x384.png",
  "/icon-v2-512x512.png",
  "/media/*",
  "/rest/*",
];
const decoSiteMapUrl = "/sitemap/deco.xml";

const CHECKOUT_PATHS_TO_PROXY = [
  "/checkout/cart",
  "/checkout/*",
  "/checkout",
  "/customer/*",
  "/customer",
];

const buildProxyRoutes = ({
  ctx,
  extraPagePaths,
  includeSiteMap,
  generateDecoSiteMap,
  excludePathsFromDecoSiteMap,
  prodUrl,
  pathsWithoutSuffix,
  suffix,
  enableRedirectRoutes,
}: {
  extraPagePaths: string[];
  includeSiteMap?: string[];
  generateDecoSiteMap?: boolean;
  ctx: AppContext;
  excludePathsFromDecoSiteMap: string[];
  prodUrl: URL;
  pathsWithoutSuffix: string[];
  suffix: string;
  enableRedirectRoutes: boolean;
}) => {
  const publicUrl = new URL(
    ctx.baseUrl?.startsWith("http") ? ctx.baseUrl : `https://${ctx.baseUrl}`,
  );

  try {
    const urlToProxy = publicUrl.href;
    const hostToUse = publicUrl.hostname;
    const firstDotIndex = hostToUse.indexOf(".");

    const routeFromPath = (pathTemplate: string, useSuffix = false): Route => ({
      pathTemplate: useSuffix ? suffix + pathTemplate : pathTemplate,
      handler: {
        value: {
          __resolveType: "magento/handlers/proxy.ts",
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

    const redirectFromPath = (
      pathTemplate: string,
    ): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "website/handlers/redirect.ts",
          to: `https://checkout.${
            hostToUse.slice(firstDotIndex + 1)
          }${suffix}${pathTemplate}`,
          type: "permanent",
        },
      },
    });

    const suffixedRoutes = [...PAGE_PATHS_TO_PROXY, ...extraPagePaths].map((
      route,
    ) => routeFromPath(route, true));

    const nonSuffixedRoutes = [...ASSETS_PATHS_TO_PROXY, ...pathsWithoutSuffix]
      .map((route) => routeFromPath(route, false));

    const checkoutRoutes = enableRedirectRoutes
      ? CHECKOUT_PATHS_TO_PROXY.map(redirectFromPath)
      : CHECKOUT_PATHS_TO_PROXY.map((path) => routeFromPath(path, true));

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
      ...checkoutRoutes,
      ...suffixedRoutes,
      ...nonSuffixedRoutes,
    ];
  } catch (e) {
    console.log("Error in Magento Proxies");
    console.error(e);
    return [];
  }
};

export interface Props {
  /**
   * @description Extra content. Use "Suffix" field to bulk changes
   */
  extraPathsToProxy?: string[];
  /**
   * @description Use a suffix to compose the proxies paths
   */
  suffix?: string;
  /**
   * @description Paths of extra content - ignoring the "suffix" field
   */
  pathsWithoutSuffix?: string[];
  /**
   * @title Redirect the checkout and customer routes to a "checkout.mypublicurl" domain
   */
  enableRedirectRoutes?: boolean;
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
    pathsWithoutSuffix = [],
    suffix = "",
    enableRedirectRoutes = false,
  }: Props,
  req: Request,
  ctx: AppContext,
): Route[] {
  const prodUrl = new URL(req.url);
  return buildProxyRoutes({
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap,
    includeSiteMap,
    extraPagePaths: extraPathsToProxy,
    ctx,
    prodUrl,
    pathsWithoutSuffix: pathsWithoutSuffix,
    suffix,
    enableRedirectRoutes,
  });
}

export default loader;
