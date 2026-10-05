const noIndexedDomains = ["decocdn.com", "deco.site", "deno.dev"];

/**
 * Whether the request is being served on a deco preview domain, whose pages
 * must carry `noindex, nofollow`.
 *
 * Behind a proxy (e.g. a CDN-level A/B worker fetching `<site>.deco.site`),
 * the public hostname arrives in `x-forwarded-host`, not in the request URL.
 * Chained proxies join values with ", ": the first one is the client-facing host.
 */
export const isUnindexedDomain = (req: Request): boolean => {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]
    .trim().toLowerCase();
  const host = forwardedHost || new URL(req.url).host;
  return noIndexedDomains.some((domain) => host.includes(domain));
};
