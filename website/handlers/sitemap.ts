import type { Handler } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/blocks/handler.ts";
import type { Resolvable } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/engine/core/resolver.ts";
import { isResolvable } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/engine/core/resolver.ts";
import { ConnInfo } from "std/http/server.ts";
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

const sanitize = (url: string) => url.startsWith("/") ? url : `/${url}`;
const siteMapFromRoutes = (publicUrl: string, routes: Route[]): string => {
  const urls: string[] = [];
  for (const route of routes) {
    if (isAbsolute(route.pathTemplate) && isPage(route.handler.value)) {
      urls.push(`${publicUrl}${sanitize(route.pathTemplate)}`);
    }
  }
  return buildSiteMap(urls);
};

/**
 * @title Sitemap
 * @description Return deco's sitemap.xml
 */
export default function SiteMap(_props: unknown) {
  return function (req: Request, connInfo: ConnInfo) {
    const reqUrl = new URL(req.url);
    const ctx = connInfo as ConnInfo & {
      params: Record<string, string>;
      state: {
        routes: Route[];
      };
    };
    return new Response(
      `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${siteMapFromRoutes(reqUrl.origin, ctx.state.routes ?? [])}
</urlset>`,
      { headers: { "content-type": "text/xml", status: "200" } },
    );
  };
}
