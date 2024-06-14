import { ConnInfo } from "std/http/server.ts";
import Proxy from "../../website/handlers/proxy.ts";
import { AppContext } from "../mod.ts";

const xmlHeader =
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

const includeSiteMaps = (
  currentXML: string,
  origin: string,
  includes?: string[]
) => {
  const siteMapIncludeTags =
    includes?.map(
      (include) => `
  <sitemap>
    <loc>${include.startsWith("/") ? `${origin}${include}` : include}</loc>
    <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
  </sitemap>`
    ) ?? [];

  return siteMapIncludeTags.length > 0
    ? currentXML.replace(
        xmlHeader,
        `${xmlHeader}\n${siteMapIncludeTags.join("\n")}`
      )
    : currentXML;
};

export interface Props {
  include?: string[];
}
/**
 * @title Sitemap Proxy
 */
export default function Sitemap({ include }: Props, appCtx: AppContext) {
  return async (req: Request, ctx: ConnInfo) => {
    const prodUrl = new URL(req.url);
    if (!appCtx.baseUrl) {
      throw new Error("Missing publicUrl");
    }

    const publicUrl = new URL(
      appCtx.baseUrl?.startsWith("http")
        ? appCtx.baseUrl
        : `https://${appCtx.baseUrl}`
    );

    const response = await Proxy({
      url: publicUrl.href,
      customHeaders: [
        {
          key: "x-forwarded-for",
          value: prodUrl.href,
        },
      ],
    })(req, ctx);

    if (!response.ok) {
      return response;
    }

    const reqUrl = new URL(req.url);
    const text = await response.text();
    return new Response(
      includeSiteMaps(
        text.replaceAll(publicUrl.href, `${reqUrl.origin}/`),
        reqUrl.origin,
        include
      ),
      {
        headers: response.headers,
        status: response.status,
      }
    );
  };
}
