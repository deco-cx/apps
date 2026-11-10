import { HttpError } from "../../utils/http.ts";

const MAX_REDIRECTS = 5;

// Hostnames that only resolve inside the runtime's own network.
const INTERNAL_HOSTNAME_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".cluster.local",
  ".svc",
];

const isPrivateIPv4 = (hostname: string) => {
  const parts = hostname.split(".");
  if (parts.length !== 4) return false;
  const octets = parts.map(Number);
  if (octets.some((n, i) => !/^\d{1,3}$/.test(parts[i]) || n > 255)) {
    return false;
  }
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
};

const isPrivateIPv6 = (hostname: string) => {
  if (!hostname.startsWith("[")) return false;
  const address = hostname.slice(1, -1).toLowerCase();
  if (address === "::" || address === "::1") return true;
  // IPv4-mapped/compatible addresses (the URL parser normalizes them to hex).
  if (
    address.startsWith("::ffff:") ||
    /^::[0-9a-f]{1,4}:[0-9a-f]{1,4}$/.test(address)
  ) {
    return true;
  }
  const first = parseInt(address.split(":")[0] || "0", 16);
  return (
    (first & 0xfe00) === 0xfc00 || // fc00::/7 unique local
    (first & 0xffc0) === 0xfe80
  ); // fe80::/10 link local
};

/**
 * Parses a URL taken from request input and rejects anything that is not a
 * public http(s) URL, so loaders that fetch it cannot read local files
 * (file://) or reach the runtime's internal network.
 */
export const parsePublicUrl = (src: string | URL): URL => {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    throw new HttpError(400, "URL must be an absolute http(s) URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new HttpError(400, "URL must be an absolute http(s) URL");
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (
    !hostname ||
    hostname === "localhost" ||
    (!hostname.includes(".") && !hostname.startsWith("[")) ||
    INTERNAL_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) ||
    isPrivateIPv4(hostname) ||
    isPrivateIPv6(hostname)
  ) {
    throw new HttpError(403, "URL host is not allowed");
  }

  return url;
};

type Fetcher<Init extends RequestInit> = (
  input: URL,
  init: Init,
) => Promise<Response>;

/**
 * fetch() for URLs taken from request input: validates the URL and every
 * redirect target, since a public URL can redirect to an internal one.
 */
export const fetchPublicUrl = async <Init extends RequestInit = RequestInit>(
  src: string | URL,
  init: Init = {} as Init,
  fetcher: Fetcher<Init> = fetch,
): Promise<Response> => {
  let url = parsePublicUrl(src);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetcher(url, { ...init, redirect: "manual" });
    const location = response.headers.get("location");

    if (response.status < 300 || response.status >= 400 || !location) {
      return response;
    }

    await response.body?.cancel();
    url = parsePublicUrl(new URL(location, url));
  }

  throw new HttpError(502, "Too many redirects");
};
