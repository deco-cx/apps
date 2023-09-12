import { ConnInfo } from "std/http/server.ts";
import Proxy from "../../website/handlers/proxy.ts";
import { AppContext } from "../mod.ts";
import { withDigestCookie } from "../utils/password.ts";

const xmlHeader =
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

const includeSiteMaps = (
  currentXML: string,
  origin: string,
  includes?: string[],
) => {
  const siteMapIncludeTags = [];

  for (const include of (includes ?? [])) {
    siteMapIncludeTags.push(`
  <sitemap>
    <loc>${include.startsWith("/") ? `${origin}${include}` : include}</loc>
    <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
  </sitemap>`);
  }
  return siteMapIncludeTags.length > 0
    ? currentXML.replace(
      xmlHeader,
      `${xmlHeader}\n${siteMapIncludeTags.join("\n")}`,
    )
    : currentXML;
};

export interface Props {
  include?: string[];
}
/**
 * @title Sitemap Proxy
 */
export default function Sitemap(
  { include }: Props,
  appCtx: AppContext,
) {
  const url = `https://${appCtx.storeName}.myshopify.com`;
  return async (
    req: Request,
    ctx: ConnInfo,
  ) => {
    if (!url) {
      throw new Error("Missing publicUrl");
    }

    const publicUrl =
      new URL(url?.startsWith("http") ? url : `https://${url}`).href;

    const response = await Proxy({
      url: publicUrl,
      customHeaders: withDigestCookie(appCtx),
    })(req, ctx);

    if (!response.ok) {
      return response;
    }

    const reqUrl = new URL(req.url);
    const text = await response.text();
    return new Response(
      includeSiteMaps(
        text.replaceAll(publicUrl, `${reqUrl.origin}/`),
        reqUrl.origin,
        include,
      ),
      {
        headers: response.headers,
        status: response.status,
      },
    );
  };
}
