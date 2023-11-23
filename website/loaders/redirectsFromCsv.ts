import { join } from "std/path/mod.ts";
import { Route } from "../flags/audience.ts";

const REDIRECT_TYPE_ENUM = ["temporary", "permanent"];

/** @titleBy from */
export interface Redirect {
  from: string;
  to: string;
  type?: "temporary" | "permanent";
}

export interface Redirects {
  /**
   * @title The file url or path
   */
  from?: string;
  redirects: Redirect[];
}

let redirectsFromFile: Promise<Route[]> | null = null;
const getRedirectFromFile = async (from: string) => {
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
    ?.split("\r\n")
    .slice(1)
    .map((row) => {
      // this regex is necessary to handle csv with comma as part of value
      const parts = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      const typeRowIndex = parts.findIndex((part: string) =>
        REDIRECT_TYPE_ENUM.includes(part)
      );

      const type = (parts[typeRowIndex] as Redirect["type"]) ?? "temporary";

      if (typeRowIndex !== -1) {
        parts.splice(typeRowIndex, 1);
      }

      const last = parts[parts.length - 1];
      parts.splice(parts.length - 1, 1);

      return [
        removeTrailingSlash(parts.join(",").replaceAll('"', "")),
        removeTrailingSlash(last.replaceAll('"', "")),
        type,
      ];
    })
    .filter(([from, to]) => from && to && from !== to)
    .map(([from, to, type]) => ({
      from,
      to,
      type: type as Redirect["type"],
    }));

  return redirectsFromFiles.map(({ from, to, type }) => ({
    pathTemplate: from,
    isHref: true,
    handler: {
      value: {
        __resolveType: "website/handlers/redirect.ts",
        to,
        type,
      },
    },
  }));
};

export const removeTrailingSlash = (path: string) =>
  path.endsWith("/") && path.length > 1 ? path.slice(0, path.length - 1) : path;

export default async function redirect({
  redirects,
  from,
}: Redirects): Promise<Route[]> {
  redirectsFromFile ??= from ? getRedirectFromFile(from) : Promise.resolve([]);

  const redirectsFromFiles: Route[] = await redirectsFromFile;

  const routes: Route[] = (redirects || []).map(({ from, to, type }) => ({
    pathTemplate: from,
    isHref: true,
    handler: {
      value: {
        __resolveType: "website/handlers/redirect.ts",
        to,
        type,
      },
    },
  }));

  return [...redirectsFromFiles, ...routes];
}
