import { PAGE_CACHE_ALLOWED_KEY } from "@deco/deco/blocks";
import type { AppContext } from "../../mod.ts";

/**
 * Opts the current page into CDN page caching.
 *
 * The runtime only emits a public `Cache-Control` when some middleware marks
 * the request as safe to cache (see `PAGE_CACHE_ALLOWED_KEY`). Commerce apps
 * like VTEX do this from their middleware, but CMS-only pages (e.g. a home
 * built purely from `website` sections, with no commerce loader) never opt in
 * and therefore stay uncached.
 *
 * Drop this section on such a page to make it cacheable. It is still guarded by
 * the runtime: if a foreign `Set-Cookie` is present, or another block on the
 * same page marks the response `no-store`, that decision wins.
 */
export const loader = (_props: unknown, _req: Request, ctx: AppContext) => {
  ctx.bag?.set(PAGE_CACHE_ALLOWED_KEY, true);
  return {};
};

// Renders nothing — this section exists only to opt the page into caching.
export default function AllowPageCache() {
  return null;
}
