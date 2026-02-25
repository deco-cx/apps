import { join } from "std/path/mod.ts";
import { Route } from "../flags/audience.ts";

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

const getRedirectFromFile = async (
  from: string,
  forcePermanentRedirects?: boolean,
) => {
  let redirectsRaw: string | null = null;
  try {
    if (from.startsWith("http")) {
      redirectsRaw = await fetch(from).then((resp) => resp.text());
    } else {
      redirectsRaw = await Deno.readTextFile(
        join(Deno.cwd(), join(...from.split("/"))),
      );
    }
  } catch (e) {
    console.error(e);
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

const routesMap = new Map<string, Promise<Route[]>>();

export default async function redirect({
  redirects,
  from = "",
  forcePermanentRedirects,
}: Redirects): Promise<Route[]> {
  const current = routesMap.get(from);

  if (!current) {
    routesMap.set(
      from,
      from
        ? getRedirectFromFile(from, forcePermanentRedirects)
        : Promise.resolve([]),
    );
  }

  const redirectsFromFiles: Route[] = await routesMap.get(from)!;

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

  return [...redirectsFromFiles, ...routes];
}
