import Proxy from "../../website/handlers/proxy.ts";
import { AppContext } from "../mod.ts";
import { withDigestCookie } from "../utils/password.ts";

type ConnInfo = Deno.ServeHandlerInfo;

const XML_HEADER =
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

// Helper function to get current date in YYYY-MM-DD format
const getToday = (): string => new Date().toISOString().substring(0, 10);

function buildIncludeSitemaps(origin: string, includes?: string[]) {
  if (!includes?.length) return "";

  const today = getToday();
  const esc = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");

  return includes
    .map((include) => {
      const loc = include.startsWith("/") ? `${origin}${include}` : include;
      const safeLoc = esc(loc);
      return `  <sitemap>\n    <loc>${safeLoc}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`;
    })
    .join("\n");
}

function excludeSitemaps(xml: string, origin: string, excludes?: string[]) {
  if (!excludes?.length) return xml;

  // Ensure all exclude prefixes start with a slash
  const normalized = excludes.map((ex) => (ex.startsWith("/") ? ex : `/${ex}`));

  return xml.replace(
    /<sitemap>\s*<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/g,
    (match, loc) => {
      let locPath: string;
      try {
        // Use origin as base to support both absolute and relative URLs
        const u = new URL(loc, origin);
        locPath = u.pathname;
      } catch {
        // If URL parsing fails, leave the sitemap entry untouched
        return match;
      }

      return normalized.some((ex) => locPath.startsWith(ex)) ? "" : match;
    },
  );
}

export interface Props {
  include?: string[];
  exclude?: string[];
}

/**
 * @title Sitemap Proxy
 */
export default function Sitemap(
  { include, exclude }: Props,
  appCtx: AppContext,
) {
  const shopifyUrl = `https://${appCtx.storeName}.myshopify.com`;

  return async (req: Request, conn: ConnInfo) => {
    const reqOrigin = new URL(req.url).origin;
    const proxyResponse = await Proxy({
      url: shopifyUrl,
      customHeaders: withDigestCookie(appCtx),
    })(req, conn);

    if (!proxyResponse.ok) return proxyResponse;

    const originalXml = await proxyResponse.text();
    const originWithSlash = reqOrigin.endsWith("/")
      ? reqOrigin.slice(0, -1)
      : reqOrigin;
    const originReplacedXml = originalXml.replaceAll(
      shopifyUrl,
      originWithSlash,
    );
    const excludedXml = excludeSitemaps(originReplacedXml, reqOrigin, exclude);

    const includeBlock = buildIncludeSitemaps(reqOrigin, include);
    const finalXml = includeBlock
      ? excludedXml.replace(XML_HEADER, `${XML_HEADER}\n${includeBlock}`)
      : excludedXml;

    const headers = new Headers(proxyResponse.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    headers.delete("etag");
    headers.delete("accept-ranges");
    if (!headers.get("content-type")?.includes("xml")) {
      headers.set("content-type", "application/xml; charset=utf-8");
    }
    return new Response(finalXml, {
      status: proxyResponse.status,
      headers,
    });
  };
}
