import Proxy from "../../website/handlers/proxy.ts";
import { AppContext } from "../mod.ts";
import { withDigestCookie } from "../utils/password.ts";

type ConnInfo = Deno.ServeHandlerInfo;

const XML_HEADER = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const TODAY = new Date().toISOString().substring(0, 10);

function buildIncludeSitemaps(origin: string, includes?: string[]) {
  if (!includes?.length) return "";

  return includes
    .map((include) => {
      const loc = include.startsWith("/") ? `${origin}${include}` : include;
      return `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`;
    })
    .join("\n");
}

function excludeSitemaps(xml: string, origin: string, excludes?: string[]) {
  if (!excludes?.length) return xml;

  return xml.replace(
    /<sitemap>\s*<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/g,
    (match, loc) => {
      const locPath = loc.startsWith(origin)
        ? loc.slice(origin.length)
        : new URL(loc).pathname;

      return excludes.some((ex) => locPath.startsWith(ex)) ? "" : match;
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
    const originWithSlash = reqOrigin.endsWith("/") ? reqOrigin.slice(0, -1) : reqOrigin;
    const originReplacedXml = originalXml.replaceAll(shopifyUrl, originWithSlash);
    const excludedXml = excludeSitemaps(originReplacedXml, reqOrigin, exclude);

    const includeBlock = buildIncludeSitemaps(reqOrigin, include);
    const finalXml = includeBlock
      ? excludedXml.replace(XML_HEADER, `${XML_HEADER}\n${includeBlock}`)
      : excludedXml;

    return new Response(finalXml, {
      headers: proxyResponse.headers,
      status: proxyResponse.status,
    });
  };
}
