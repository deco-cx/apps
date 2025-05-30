import { getSetCookies, setCookie } from "std/http/cookie.ts";
import { SESSION_COOKIE } from "./constants.ts";

function getApexDomain(url: string | URL) {
  // Cria um objeto URL para analisar a URL
  const parsedUrl = new URL(url);

  // Extrai o hostname da URL (exclui o protocolo, como http://)
  const hostname = parsedUrl.hostname;

  // Divide o hostname em partes
  const parts = hostname.split(".");

  // Se o domínio tem mais de dois níveis, pega os dois últimos (domínio + TLD)
  if (parts.length > 2) {
    const lastTopLevelDomain = parts[parts.length - 1];
    if (lastTopLevelDomain.length > 2) {
      return parts.slice(parts.length - 2).join(".");
    }

    return parts.slice(parts.length - 3).join(".");
  }

  // Caso contrário, retorna o hostname inteiro (ex: "example.com")
  return hostname;
}

export const proxySetCookie = (
  from: Headers,
  to: Headers,
  toDomain?: URL | string,
) => {
  let newDomain: string | undefined = undefined;

  if (toDomain) {
    if (toDomain.toString().includes("localhost")) {
      newDomain = "localhost";
    } else {
      newDomain = `.${getApexDomain(toDomain)}`;
    }
  }

  for (const cookie of getSetCookies(from)) {
    if (cookie.name === SESSION_COOKIE) {
      continue;
    }
    const newCookie = newDomain
      ? {
        ...cookie,
        domain: newDomain,
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
  return slug.replace(/\/[^\/]*$/, "").replace(/^[\/]+/, "");
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
