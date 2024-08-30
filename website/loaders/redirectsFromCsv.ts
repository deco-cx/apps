import { join } from "std/path/mod.ts";
import { Route } from "../flags/audience.ts";

const REDIRECT_TYPE_ENUM = ["temporary", "permanent"];
const CONCATENATE_PARAMS_VALUES = ["true", "false"];

/** @titleBy from */
export interface Redirect {
  from: string;
  to: string;
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

  const redirectsFromFiles: Redirects["redirects"] = redirectsRaw
    ?.split(/\r\n|\r|\n/)
    .slice(1)
    .map((row) => {
      // this regex is necessary to handle csv with comma as part of value
      const parts = row.split(/,|;(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      const type = findAndRemove(parts, REDIRECT_TYPE_ENUM) ??
        (forcePermanentRedirects ? "permanent" : "temporary");
      const discardQueryParameters =
        findAndRemove(parts, CONCATENATE_PARAMS_VALUES) === "true";
      const from = parts[0];
      const to = parts[1];

      return [
        from,
        to,
        type,
        discardQueryParameters,
      ];
    })
    .filter(([from, to]) => from && to && from !== to)
    .map(([from, to, type, discardQueryParameters]) => ({
      from: from as string,
      to: to as string,
      type: type as Redirect["type"],
      discardQueryParameters: discardQueryParameters as boolean,
    }));

  return redirectsFromFiles.map((
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
