import { isResolvable, type Resolvable } from "@deco/deco";
import { type Handler } from "@deco/deco/blocks";
import { Route } from "../flags/audience.ts";

const isPage = (handler: Resolvable<Handler>) =>
  isResolvable(handler) &&
  handler.__resolveType.endsWith("handlers/fresh.ts");

const isAbsolute = (href: string) =>
  !href.includes(":") && !href.includes("*") && !href.startsWith("/_live");

const buildSiteMap = (urls: string[]) => {
  const entries: string[] = [];
  for (const url of urls) {
    entries.push(`
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`);
  }
  return entries.join("\n");
};

const sanitize = (url: string) => {
  const withSlash = url.startsWith("/") ? url : `/${url}`;
  // Replace & with &amp;
  // In XML, &amp; means an actual & in the data
  return withSlash.replace(/&(?!amp;)/g, "&amp;");
};

const siteMapFromRoutes = (
  publicUrl: string,
  routes: Route[],
  excludePaths?: string[],
  includePaths?: string[],
): string => {
  const urls: string[] = [];
  const excludePathsSet = new Set(excludePaths);
  const includePathsSet = new Set(includePaths);

  for (const route of routes) {
    if (
      !excludePathsSet.has(route.pathTemplate) &&
      isAbsolute(route.pathTemplate) && isPage(route.handler.value)
    ) {
      urls.push(`${publicUrl}${sanitize(route.pathTemplate)}`);
    }
  }

  if (includePathsSet.size > 0) {
    for (const path of includePathsSet) {
      // Skip if path is excluded or not absolute
      if (excludePathsSet.has(path) || !isAbsolute(path)) {
        continue;
      }

      const url = `${publicUrl}${sanitize(path)}`;

      // Avoid duplicates
      if (urls.includes(url)) {
        continue;
      }

      urls.push(url);
    }
  }

  return buildSiteMap(urls);
};
interface Props {
  excludePaths?: string[];
  includePaths?: string[];
}
/**
 * @title Sitemap
 * @description Return deco's sitemap.xml
 */
export default function SiteMap({
  excludePaths = [],
  includePaths = [],
}: Props) {
  return function (req: Request, connInfo: Deno.ServeHandlerInfo) {
    const reqUrl = new URL(req.url);
    const ctx = connInfo as Deno.ServeHandlerInfo & {
      params: Record<string, string>;
      state: {
        routes: Route[];
      };
    };

    const sitemap = siteMapFromRoutes(
      reqUrl.origin,
      ctx.state.routes ?? [],
      excludePaths,
      includePaths,
    );

    return new Response(
      `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap}
</urlset>`,
      { headers: { "content-type": "text/xml", status: "200" } },
    );
  };
}
