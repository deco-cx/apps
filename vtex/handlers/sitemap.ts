import Proxy from "../../website/handlers/proxy.ts";
import { ConnInfo } from "std/http/server.ts";
import { AppContext } from "../mod.ts";

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
  { publicUrl: url, usePortalSitemap, account }: AppContext,
) {
  return async (
    req: Request,
    ctx: ConnInfo,
  ) => {
    if (!url) {
      throw new Error("Missing publicUrl");
    }

    const urlFromPublicUrl =
      new URL(url?.startsWith("http") ? url : `https://${url}`).href;

    /**
     * Some stores were having problems with the IO sitemap (missing categories and brands)
     */
    const publicUrl = usePortalSitemap
      ? `https://${account}.vtexcommercestable.com.br/`
      : urlFromPublicUrl;

    const response = await Proxy({
      url: publicUrl,
    })(req, ctx);

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
