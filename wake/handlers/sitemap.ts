import Proxy, { Header } from "../../website/handlers/proxy.ts";
import { AppContext } from "../mod.ts";

type ConnInfo = Deno.ServeHandlerInfo;
const BASE_SITEMAP_URL =
  "https://p-general-sitemap-public.s3.us-east-2.amazonaws.com/Sitemap";

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
          <loc>${
      include.startsWith("/") ? `${origin}${include}` : include
    }</loc>
          <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
      </sitemap>
    `);
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
  customHeaders: Header[];
}
/**
 * @title Sitemap Proxy
 */
export default function Sitemap(
  { include, customHeaders }: Props,
  { account }: AppContext,
) {
  return async (
    req: Request,
    ctx: ConnInfo,
  ) => {
    if (!account) {
      throw new Error("Missing account");
    }

    const publicUrl = `${BASE_SITEMAP_URL}/${account}/`;

    const response = await Proxy({
      url: publicUrl,
      customHeaders,
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
