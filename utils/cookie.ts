import { getCookies, getSetCookies, setCookie } from "std/http/cookie.ts";
import { tryOrDefault } from "deco/utils/object.ts";
import { Flag } from "deco/types.ts";
import { DECO_SEGMENT } from "deco/runtime/fresh/middlewares/3_main.ts";

export const getFlagsFromRequest = (req: Request) => {
  const cookies = getCookies(req.headers);
  return getFlagsFromCookies(cookies);
};

export const getFlagsFromCookies = (cookies: Record<string, string>) => {
  const flags: Flag[] = [];
  const segment = cookies[DECO_SEGMENT]
    ? tryOrDefault(
      () => JSON.parse(decodeURIComponent(atob(cookies[DECO_SEGMENT]))),
      {},
    )
    : {};

  segment.active?.forEach((flag: string) =>
    flags.push({ name: flag, value: true })
  );
  segment.inactiveDrawn?.forEach((flag: string) =>
    flags.push({ name: flag, value: false })
  );

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
