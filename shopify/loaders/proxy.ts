import { Route } from "../../website/flags/audience.ts";
import { TextReplace } from "../../website/handlers/proxy.ts";
import { AppContext } from "../mod.ts";
import { withDigestCookie } from "../utils/password.ts";

const PATHS_TO_PROXY = [
  "/checkout",
  "/checkouts/*",
  "/*/checkouts/*",
  "/cart",
  "/cart/*",
  "/account",
  "/account/*",
  "/password",
  "/password/*",
  "/challenge",
  "/challenge/*",
  "/services/*",
  "/.well-known/*",
  "/services/*",
  "/apps/*",
  "/proxy/validate",
  "/proxy/validate/*",
  "/*/orders/*",
];
const decoSiteMapUrl = "/sitemap/deco.xml";

const buildProxyRoutes = (
  {
    ctx,
    ctx: { storeName, publicUrl },
    extraPathsToProxy = [],
    extraPaths = [],
    includeSiteMap,
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap,
    excludePathsFromShopifySiteMap,
    replaces,
  }: Props & {
    ctx: AppContext;
    extraPaths?: string[];
  },
) => {
  // Handle backward compatibility for extraPaths prop
  const finalExtraPathsToProxy = extraPathsToProxy.length > 0
    ? extraPathsToProxy
    : extraPaths;
  if (extraPaths.length > 0 && extraPathsToProxy.length === 0) {
    console.warn(
      'DEPRECATION WARNING: "extraPaths" prop is deprecated. Use "extraPathsToProxy" instead.',
    );
  }
  const urlToUse = publicUrl
    ? new URL(publicUrl.startsWith("http") ? publicUrl : `https://${publicUrl}`)
    : new URL(`https://${storeName}.myshopify.com`);

  const hostname = urlToUse.hostname;

  try {
    // Rejects TLD mystore.com, keep this if Shopify doesn't support
    if (!hostname || hostname.split(".").length <= 2) {
      throw new Error(`Invalid hostname from '${publicUrl}'`);
    }

    // TODO @lucis: Fix the proxy, MITM

    const urlToProxy = `https://${hostname}`;
    const hostToUse = hostname;

    const routeFromPath = (pathTemplate: string): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: pathTemplate.includes("sitemap")
            ? "shopify/handlers/sitemap.ts"
            : "website/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
          customHeaders: withDigestCookie(ctx),
          replaces,
        },
      },
    });
    const routesFromPaths = [...PATHS_TO_PROXY, ...finalExtraPathsToProxy].map(
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
            exclude: excludePathsFromShopifySiteMap,
            __resolveType: "shopify/handlers/sitemap.ts",
          },
        },
      },
      {
        pathTemplate: "/sitemap*",
        handler: {
          value: {
            __resolveType: "shopify/handlers/sitemap.ts",
          },
        },
      },
      ...routesFromPaths,
    ];
  } catch (e) {
    console.log("Error parsing publicUrl from Shopify");
    console.error(e);
    return [];
  }
};

export interface Props {
  extraPathsToProxy?: string[];
  /**
   * @deprecated Use extraPathsToProxy instead
   */
  extraPaths?: string[];
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
   * @title Exclude paths from /shopify-sitemap.xml
   */
  excludePathsFromShopifySiteMap?: string[];
  replaces?: TextReplace[];
}

/**
 * @title Shopify Proxy Routes
 */
function loader(
  {
    extraPathsToProxy = [],
    extraPaths = [],
    includeSiteMap = [],
    generateDecoSiteMap = true,
    excludePathsFromDecoSiteMap = [],
    excludePathsFromShopifySiteMap = [],
    replaces = [],
  }: Props,
  _req: Request,
  ctx: AppContext,
): Route[] {
  return buildProxyRoutes({
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap,
    excludePathsFromShopifySiteMap,
    includeSiteMap,
    extraPathsToProxy,
    extraPaths,
    replaces,
    ctx,
  });
}

export default loader;
