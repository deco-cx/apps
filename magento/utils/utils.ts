import { getSetCookies, setCookie } from "std/http/cookie.ts";
import { SESSION_COOKIE } from "./constants.ts";
import { Features } from "../mod.ts";

export const proxySetCookie = (
  from: Headers,
  to: Headers,
  toDomain?: URL | string,
) => {
  const newDomain = toDomain && new URL(toDomain);

  for (const cookie of getSetCookies(from)) {
    if (cookie.name === SESSION_COOKIE) {
      continue;
    }
    const newCookie = newDomain
      ? {
        ...cookie,
        domain: newDomain.hostname,
      }
      : cookie;

    setCookie(to, newCookie);
  }
};

export function extractLastPath(slug: string) {
  const path = slug.split("/");
  return path[path.length - 1];
}

export function extractInitialPath(slug: string) {
  return slug.replace(/\/[^\/]*$/, "");
}

export const sortSearchParams = (url: URL) => {
  const paramsArray = Array.from(url.searchParams.entries());
  paramsArray.sort((a, b) => a[0].localeCompare(b[0]));
  const sortedParams = paramsArray.map(([key, value]) => {
    const sortedValue = value.split("_").sort((a, b) => a.localeCompare(b))
      .join("_");
    return `${key}=${sortedValue}`;
  });
  return sortedParams.join("&");
};

export function decodeFeatures(stringfiedSession: string | null): Features {
  try {
    if (!stringfiedSession) {
      throw new Error("Features not found");
    }
    const decoded = atob  (stringfiedSession);
    const features = JSON.parse(decoded) as Features;
    return features;
  } catch (error) {
    console.error("error in features decode: " + error);
    return {
      dangerouslyDisableOnLoadUpdate: false,
      dangerouslyDisableOnVisibilityChangeUpdate: false,
      dangerouslyDisableWishlist: false,
      dangerouslyReturnNullAfterAction: false,
    };
  }
}
