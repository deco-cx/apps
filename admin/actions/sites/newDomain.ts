import { AppContext, SiteName } from "../../mod.ts";
export interface Props {
  site: SiteName;
  domain: string;
}

const CLOUDFLARE_API_HOST = "https://api.cloudflare.com/client/v4";
const CLOUDFLARE_TOKEN = Deno.env.get("CLOUDFLARE_TOKEN");
const CLOUDFLARE_API_EMAIL = Deno.env.get("CLOUDFLARE_API_EMAIL");
const CLOUDFLARE_API_KEY = Deno.env.get("CLOUDFLARE_API_KEY");

const CUSTOM_HOSTNAME_POST_BODY = {
  "ssl": {
    "bundle_method": "ubiquitous",
    "method": "http",
    "type": "dv",
    "settings": {
      "ciphers": [
        "ECDHE-RSA-AES128-GCM-SHA256",
        "AES128-SHA",
      ],
      "early_hints": "on",
      "http2": "on",
      "min_tls_version": "1.2",
      "tls_1_3": "on",
    },
    "wildcard": false,
  },
};
/**
 * Creates a new domain for the given site.
 */
export default async function newDomain(
  { site, domain }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const platform = await ctx.invoke["deco-sites/admin"].loaders.platforms
    .forSite({ site });
  const promises: Promise<void>[] = [];
  const needsCustomHostname = !domain.endsWith(platform.domain);
  if (needsCustomHostname) {
    const path =
      `${CLOUDFLARE_API_HOST}/zones/${platform.cfZoneId}/custom_hostnames`;
    promises.push(
      fetch(encodeURI(path), {
        method: "POST",
        body: JSON.stringify({
          "hostname": domain,
          ...CUSTOM_HOSTNAME_POST_BODY,
        }),
        headers: {
          "Authorization": `Bearer ${CLOUDFLARE_TOKEN}`,
          "Content-Type": "application/json",
          "X-Auth-Email": `${CLOUDFLARE_API_EMAIL}`,
          "X-Auth-Key": `${CLOUDFLARE_API_KEY}`,
        },
      }).then(() => {
      }),
    );
  }

  await Promise.all([
    platform.domains.create({ site, domain }),
    ...promises,
  ]);
}
