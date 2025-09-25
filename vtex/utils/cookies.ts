import {
  type Cookie,
  getCookies,
  getSetCookies,
  setCookie,
} from "std/http/cookie.ts";
import { SEGMENT_COOKIE_NAME } from "./segment.ts";

export const stringify = (cookies: Record<string, string>) =>
  Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");

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

export const setCookiesFromSession = (
  from: Headers,
  to: Headers,
  domain: URL | string,
) => {
  const newDomain = new URL(domain);

  for (const cookie of getSetCookies(from)) {
    const newCookie = cookie.name === SEGMENT_COOKIE_NAME
      ? {
        value: cookie.value,
        name: cookie.name,
        path: "/",
        secure: true,
        httpOnly: true,
      }
      : {
        ...cookie,
        domain: newDomain.hostname,
      };

    setCookie(to, newCookie);
  }
};

/**
 * Junta os cookies do request original com os Set-Cookie recebidos de uma resposta
 * e retorna o valor pronto para o header "Cookie".
 */
export interface CookieJarResult {
  header: string;
  record: Record<string, string>;
  detailed: Cookie[];
}

export function buildCookieJar(
  reqHeaders: Headers,
  upstreamSetCookies: Cookie[],
): CookieJarResult {
  const incoming = getCookies(reqHeaders);
  const jar = new Map<string, Cookie>();

  // Normaliza cookies do request para o formato Cookie
  Object.entries(incoming).forEach(([name, value]) => {
    jar.set(name, { name, value });
  });

  // Aplica Set-Cookie do upstream (sobrescreve se necessário)
  upstreamSetCookies
    .filter((c) => c?.name && c.value !== undefined) // permite value vazio ""
    .forEach((cookie) => jar.set(cookie.name, cookie));

  const cookies = Array.from(jar.values());

  return {
    header: cookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; "),
    record: Object.fromEntries(
      cookies.map((c) => [c.name, c.value]),
    ),
    detailed: cookies,
  };
}

export const CHECKOUT_DATA_ACCESS_COOKIE = "CheckoutDataAccess";
export const VTEX_CHKO_AUTH = "Vtex_CHKO_Auth";
export const REFRESH_TOKEN_COOKIE = "vid_rt";
