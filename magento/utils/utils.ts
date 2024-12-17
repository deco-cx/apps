import { getSetCookies, setCookie } from "std/http/cookie.ts";
import { SESSION_COOKIE } from "./constants.ts";

export const proxySetCookie = (
  from: Headers,
  to: Headers,
  toDomain?: URL | string,
) => {
  const domain = toDomain && new URL(toDomain);
  const newDomain = domain && !domain.hostname.includes("localhost")
    ? new URL(getTopDomain(domain.hostname))
    : domain;

  console.log({ newDomain });

  for (const cookie of getSetCookies(from)) {
    // if (cookie.name === SESSION_COOKIE) {
    //   continue;
    // }
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

export const sanitizePath = (path: string) => path.replace(/^\/?(rest\/)?/, "");

export const getTopDomain = (domain: string): string => {
  // Remove protocol and any trailing slash
  const cleanDomain = domain.replace(/^(https?:)?\/\//, "").replace(/\/$/, "");

  // Split by dots and get the last two parts
  const parts = cleanDomain.split(".");
  if (parts.length <= 2) return cleanDomain;
  if (parts.length > 3) {
    return parts.slice(-3).join(".");
  }

  return parts.slice(-2).join(".");
};
