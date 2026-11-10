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

const isPrivateAddress = (hostname: string) =>
  isPrivateIPv4(hostname) || isPrivateIPv6(hostname);

const isIpLiteral = (hostname: string) =>
  hostname.startsWith("[") || /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

export type AllowUrl = (url: URL | string) => boolean;

/**
 * The Website app's URL allowlist as a predicate, or undefined when the list
 * is empty, since an empty list allows any public URL.
 */
export const allowlist = (patterns?: URLPattern[]): AllowUrl | undefined =>
  patterns?.length
    ? (url) => patterns.some((pattern) => pattern.test(url))
    : undefined;

export interface PublicUrlOptions {
  /** Reject plain http, including on redirect targets. */
  httpsOnly?: boolean;
  /** Reject URLs outside an allowlist, including on redirect targets. */
  allowUrl?: AllowUrl;
}

/**
 * Parses a URL taken from request input and rejects anything that is not a
 * public http(s) URL, so loaders that fetch it cannot read local files
 * (file://) or reach the runtime's internal network.
 */
export const parsePublicUrl = (
  src: string | URL,
  { httpsOnly = false, allowUrl }: PublicUrlOptions = {},
): URL => {
  const protocolError = () =>
    new HttpError(
      400,
      httpsOnly
        ? "URL must be an absolute https URL"
        : "URL must be an absolute http(s) URL",
    );

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    throw protocolError();
  }

  if (
    url.protocol !== "https:" && (httpsOnly || url.protocol !== "http:")
  ) {
    throw protocolError();
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (
    !hostname ||
    hostname === "localhost" ||
    (!hostname.includes(".") && !hostname.startsWith("[")) ||
    INTERNAL_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) ||
    isPrivateAddress(hostname)
  ) {
    throw new HttpError(403, "URL host is not allowed");
  }

  if (allowUrl && !allowUrl(url)) {
    throw new HttpError(403, "URL is not in the allowlist");
  }

  return url;
};

export type ResolveDns = (
  hostname: string,
  recordType: "A" | "AAAA",
) => Promise<string[]>;

// Resolver output goes through the URL parser so it gets the same normalized
// form (bracketed, hex IPv4-mapped) that the range checks expect.
const normalizeAddress = (address: string) =>
  new URL(`http://${address.includes(":") ? `[${address}]` : address}/`)
    .hostname;

/**
 * A public name can still point at an internal address, so check what the
 * host resolves to. The connection resolves again, so this does not stop DNS
 * rebinding.
 */
const assertPublicResolution = async (url: URL, resolveDns: ResolveDns) => {
  if (isIpLiteral(url.hostname)) return;

  const results = await Promise.allSettled([
    resolveDns(url.hostname, "A"),
    resolveDns(url.hostname, "AAAA"),
  ]);
  const addresses = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  if (addresses.length === 0) {
    throw new HttpError(502, "URL host could not be resolved");
  }
  if (
    addresses.some((address) => isPrivateAddress(normalizeAddress(address)))
  ) {
    throw new HttpError(403, "URL host is not allowed");
  }
};

type Fetcher<Init extends RequestInit> = (
  input: URL,
  init: Init,
) => Promise<Response>;

export interface FetchPublicUrlOptions<Init extends RequestInit>
  extends PublicUrlOptions {
  fetcher?: Fetcher<Init>;
  resolveDns?: ResolveDns;
}

/**
 * fetch() for URLs taken from request input: validates the URL, what its host
 * resolves to, and every redirect target, since a public URL can redirect to
 * an internal one.
 */
export const fetchPublicUrl = async <Init extends RequestInit = RequestInit>(
  src: string | URL,
  init: Init = {} as Init,
  {
    fetcher = fetch,
    resolveDns = Deno.resolveDns,
    httpsOnly,
    allowUrl,
  }: FetchPublicUrlOptions<Init> = {},
): Promise<Response> => {
  let url = parsePublicUrl(src, { httpsOnly, allowUrl });

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicResolution(url, resolveDns);

    const response = await fetcher(url, { ...init, redirect: "manual" });
    const location = response.headers.get("location");

    if (response.status < 300 || response.status >= 400 || !location) {
      return response;
    }

    await response.body?.cancel();

    let next: URL;
    try {
      next = new URL(location, url);
    } catch {
      throw new HttpError(502, "Invalid redirect location");
    }
    url = parsePublicUrl(next, { httpsOnly, allowUrl });
  }

  throw new HttpError(502, "Too many redirects");
};

/**
 * Reads a response body as text, failing once it grows past `maxBytes` so a
 * URL from request input cannot exhaust memory.
 */
export const readTextWithLimit = async (
  response: Response,
  maxBytes: number,
): Promise<string> => {
  const tooLarge = () =>
    new HttpError(413, `Response is larger than ${maxBytes} bytes`);

  if (Number(response.headers.get("content-length")) > maxBytes) {
    await response.body?.cancel();
    throw tooLarge();
  }
  if (!response.body) return "";

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let size = 0;
  let text = "";

  for (
    let chunk = await reader.read();
    !chunk.done;
    chunk = await reader.read()
  ) {
    size += chunk.value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw tooLarge();
    }
    text += decoder.decode(chunk.value, { stream: true });
  }

  return text + decoder.decode();
};
