import { AppContext } from "../mod.ts";
import { ConnInfo } from "std/http/server.ts";

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
  const { publicUrl } = appCtx;
  return (
    req: Request,
    _ctx: ConnInfo,
  ) => {
    if (!publicUrl) {
      throw new Error("Missing publicUrl");
    }

    const url = new URL(
      publicUrl?.startsWith("http") ? publicUrl : `https://${publicUrl}`,
    );

    const headers = new Headers();
    headers.set("Content-Type", "application/xml");

    const reqUrl = new URL(req.url);
    const text = `${xmlHeader} 
        <sitemap>
          <loc>${url.host}sitemap/vnda.xml</loc>
        </sitemap>
      </sitemapindex>`;
    return new Response(
      includeSiteMaps(
        text.replaceAll(publicUrl, `${reqUrl.origin}/`),
        reqUrl.origin,
        include,
      ),
      {
        headers,
        status: 200,
      },
    );
  };
}
