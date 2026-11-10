import { extname, isAbsolute, join, relative, SEP } from "std/path/mod.ts";
import { Route } from "../flags/audience.ts";
import type { AppContext } from "../mod.ts";
import { fetchPublicUrl, readTextWithLimit } from "../utils/publicUrl.ts";

const MAX_CACHED_FILES = 50;
const MAX_REMOTE_FILE_BYTES = 20 * 1024 * 1024;

const REDIRECT_TYPE_ENUM = ["temporary", "permanent"];
const CONCATENATE_PARAMS_VALUES = ["true", "false"];

/** @titleBy from */
export interface Redirect {
  from: string;
  to: string;
  /**
   * @default "temporary"
   */
  type?: "temporary" | "permanent";
  discardQueryParameters?: boolean;
}

export interface Redirects {
  /**
   * @title The file url or path
   */
  from?: string;
  forcePermanentRedirects?: boolean;
  redirects: Redirect[];
}

function findAndRemove<T>(array: T[], values: T[]): T | null {
  const index = array.findIndex((item) => values.includes(item));
  if (index !== -1) {
    const removedItem = array.splice(index, 1)[0];
    return removedItem;
  }
  return null;
}

// `from` reaches this loader through request input, so a local path must stay
// inside the site and point at a CSV file.
const readLocalCsv = (from: string) => {
  const root = Deno.cwd();
  const path = join(root, ...from.split("/"));
  const fromRoot = relative(root, path);

  if (
    fromRoot === ".." ||
    fromRoot.startsWith(`..${SEP}`) ||
    isAbsolute(fromRoot) ||
    extname(path).toLowerCase() !== ".csv"
  ) {
    throw new Error(`Redirects file must be a .csv inside the site: ${from}`);
  }

  return Deno.readTextFile(path);
};

const isRemote = (from: string) => /^https?:\/\//i.test(from);

// Plain http is refused, so a remote file is not fetched in clear text.
const fetchRemoteCsv = async (from: string) => {
  const response = await fetchPublicUrl(from, {}, { httpsOnly: true });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Redirects file responded ${response.status}: ${from}`);
  }
  return readTextWithLimit(response, MAX_REMOTE_FILE_BYTES);
};

// Resolves to null when the file could not be read, so the failure is not
// cached.
const getRedirectFromFile = async (
  from: string,
  forcePermanentRedirects?: boolean,
): Promise<Route[] | null> => {
  let redirectsRaw: string | null = null;
  try {
    redirectsRaw = isRemote(from)
      ? await fetchRemoteCsv(from)
      : await readLocalCsv(from);
  } catch (e) {
    console.error(e);
    return null;
  }

  if (!redirectsRaw) {
    return [];
  }

  // this regex is necessary to handle csv with comma as part of value
  const csvFieldSplit = /,|;(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  const lines = redirectsRaw.split(/\r\n|\r|\n/);
  const routes: Route[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(csvFieldSplit);
    const type = findAndRemove(parts, REDIRECT_TYPE_ENUM) ??
      (forcePermanentRedirects ? "permanent" : "temporary");
    const discardQueryParameters =
      findAndRemove(parts, CONCATENATE_PARAMS_VALUES) === "true";
    const from = parts[0];
    const to = parts[1];

    if (!from || !to || from === to) continue;

    routes.push({
      pathTemplate: from,
      isHref: true,
      handler: {
        value: {
          __resolveType: "website/handlers/redirect.ts",
          to,
          type: type as Redirect["type"],
          discardQueryParameters,
        },
      },
    });
  }

  return routes;
};

export const removeTrailingSlash = (path: string) =>
  path.endsWith("/") && path.length > 1 ? path.slice(0, path.length - 1) : path;

const routesMap = new Map<string, Promise<Route[] | null>>();

// Same rule as the image and asset proxies: an empty allowlist allows any
// public https source.
const isAllowedSource = (from: string, patterns?: URLPattern[]) =>
  !patterns?.length || patterns.some((pattern) => pattern.test(from));

export default async function redirect(
  {
    redirects,
    from = "",
    forcePermanentRedirects,
  }: Redirects,
  _req?: Request,
  ctx?: AppContext,
): Promise<Route[]> {
  const routes: Route[] = (redirects || []).map((
    { from, to, type, discardQueryParameters },
  ) => ({
    pathTemplate: from,
    isHref: true,
    handler: {
      value: {
        __resolveType: "website/handlers/redirect.ts",
        to,
        type,
        discardQueryParameters,
      },
    },
  }));

  // Checked before the cache, so a source removed from the allowlist stops
  // being served without a restart.
  if (isRemote(from) && !isAllowedSource(from, ctx?.whitelistPatterns)) {
    console.error(`Redirects file is not in the URL allowlist: ${from}`);
    return routes;
  }

  let pending = routesMap.get(from);

  if (!pending) {
    if (routesMap.size >= MAX_CACHED_FILES) {
      routesMap.delete(routesMap.keys().next().value!);
    }
    pending = from
      ? getRedirectFromFile(from, forcePermanentRedirects)
      : Promise.resolve([]);
    routesMap.set(from, pending);
  }

  const redirectsFromFiles = await pending;
  if (redirectsFromFiles === null && routesMap.get(from) === pending) {
    routesMap.delete(from);
  }

  return [...(redirectsFromFiles ?? []), ...routes];
}
