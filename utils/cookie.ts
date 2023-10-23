import { getCookies, getSetCookies, setCookie } from "std/http/cookie.ts";

export const getFlagsFromCookies = (req: Request) => {
  const flags = [];
  const cookies = getCookies(req.headers);

  for (const [key, value] of Object.entries(cookies)) {
    if (key.startsWith("deco_matcher_")) {
      const flagName = atob(
        value.slice(value.indexOf("=") + 1, value.indexOf("@")),
      );
      const flagValue = value.at(-1) === "1" ? true : false;
      flags.push({ flagName, flagValue });
    }
  }
  return flags;
};

export const proxySetCookie = (
  from: Headers,
  to: Headers,
  toDomain?: URL | string,
) => {
  const newDomain = toDomain && new URL(toDomain);

  for (const cookie of getSetCookies(from)) {
    const newCookie = newDomain
      ? {
        ...cookie,
        domain: newDomain.hostname,
      }
      : cookie;

    setCookie(to, newCookie);
  }
};
