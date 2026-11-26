import { asResolved, isResolvable } from "@deco/deco";
import type { Routes } from "../flags/audience.ts";

/**
 * App state key holding the site's `routes` config as written, before
 * resolution. Written by `onBeforeResolveProps`, read by the router.
 */
export const RAW_ROUTES_KEY = "__rawRoutes";

const PAGES_LOADER = "website/loaders/pages.ts";

/**
 * Wraps the route config so prop resolution leaves it as written: `routes`
 * itself is resolved once, at app install, against the published release.
 */
export const stashRawRoutes = (routes: Routes[]): Routes[] =>
  asResolved(routes, false);

// Prop resolution follows the decofile's hints, and an injected key has none,
// so the stash usually reaches the app state still in its `resolved` envelope.
const unwrap = (stash: unknown): unknown =>
  typeof stash === "object" &&
    stash !== null &&
    "__resolveType" in stash &&
    stash.__resolveType === "resolved" &&
    "data" in stash
    ? stash.data
    : stash;

const isPagesLoader = (entry: unknown): boolean =>
  isResolvable(entry) && entry.__resolveType === PAGES_LOADER;

/**
 * The site's routes for a Fast Preview draft request.
 *
 * `installed` was resolved at app install against the published release, so
 * a page that exists only in the draft has no route in it. Re-resolve the
 * pages loader entries against the draft (`resolve` must be bound to the
 * draft request) and keep every other installed entry.
 *
 * Resolution drops entries that resolve to nothing (e.g. a multivariate flag
 * with no matching variant). Then `installed` no longer lines up with the
 * config, so the whole config is resolved against the draft instead.
 *
 * An entry that fails to resolve keeps its installed value when there is one,
 * so a broken draft degrades to the published routes instead of failing the
 * request.
 */
export const draftAppRoutes = async (
  stash: unknown,
  installed: Routes[] | undefined,
  resolve: (entry: Routes) => Promise<Routes | undefined>,
): Promise<Routes[] | undefined> => {
  const raw = unwrap(stash);
  if (!Array.isArray(raw) || !raw.some(isPagesLoader)) {
    return installed;
  }
  const resolveOr = async (entry: Routes, fallback?: Routes) => {
    try {
      return (await resolve(entry)) ?? fallback;
    } catch (error) {
      console.error("Could not resolve draft routes", error);
      return fallback;
    }
  };
  const aligned = Array.isArray(installed) && installed.length === raw.length;
  const routes = await Promise.all(
    raw.map((entry: Routes, i) =>
      !aligned
        ? resolveOr(entry)
        : isPagesLoader(entry)
        ? resolveOr(entry, installed[i])
        : installed[i]
    ),
  );
  return routes.filter((entry): entry is Routes => entry != null);
};
