/**
 * Lightweight allowlist-based HTML sanitizer that works in both Deno (SSR)
 * and browser contexts without external dependencies.
 *
 * Strips the most dangerous XSS vectors from CMS-provided HTML:
 *  - <script> and <style> blocks
 *  - Inline event-handler attributes (on*)
 *  - javascript:, data: and vbscript: values in url-bearing attributes
 */
const URL_ATTRS = "href|src|action|formaction|xlink:href";
const DANGEROUS_PROTOCOLS = "javascript|data|vbscript";

// Captures a url-bearing attribute and its value (double/single-quoted or bare).
const URL_ATTR_RE = new RegExp(
  `\\b(${URL_ATTRS})\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`,
  "gi",
);
// A dangerous scheme must be a real scheme: name immediately followed by ":".
const DANGEROUS_SCHEME_RE = new RegExp(`^(?:${DANGEROUS_PROTOCOLS}):`, "i");

function toCodePoint(n: number): string {
  return Number.isFinite(n) && n >= 0 && n <= 0x10ffff
    ? String.fromCodePoint(n)
    : "";
}

/** Decode the HTML entities most commonly used to smuggle a scheme past a filter. */
function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => toCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, dec) => toCodePoint(parseInt(dec, 10)))
    .replace(/&colon;/gi, ":")
    .replace(/&tab;/gi, "\t")
    .replace(/&newline;/gi, "\n");
}

/**
 * True when an attribute value resolves to a dangerous URL scheme. The value is
 * decoded and stripped of whitespace/control chars first, since browsers ignore
 * those within a scheme (e.g. `java\tscript:` and `&#106;avascript:`).
 */
export function hasDangerousScheme(value: string): boolean {
  const normalized = decodeEntities(value)
    // Control chars are intentional: browsers strip C0 controls/whitespace from
    // a URL scheme, so an attacker can hide one inside `javascript:`.
    // deno-lint-ignore no-control-regex
    .replace(/[\s\u0000-\u001f]+/g, "")
    .toLowerCase();
  return DANGEROUS_SCHEME_RE.test(normalized);
}

/**
 * Points every url-bearing attribute carrying a dangerous scheme at "#". A
 * single pass handles quoted and unquoted values identically — an unquoted
 * `href=javascript:alert(1)` is just as executable as a quoted one — while
 * harmless values like "data-*" or "javascriptX" are left intact.
 */
export function neutralizeUrlSchemes(html: string): string {
  return html.replace(URL_ATTR_RE, (match, attr, value) => {
    const quote = value[0] === '"' || value[0] === "'" ? value[0] : "";
    const inner = quote ? value.slice(1, -1) : value;
    if (!hasDangerousScheme(inner)) return match;
    const q = quote || '"';
    return `${attr}=${q}#${q}`;
  });
}

export function sanitizeHtml(raw: string | null | undefined): string {
  if (typeof raw !== "string" || !raw) return "";
  return neutralizeUrlSchemes(
    raw
      .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
      .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, ""),
  );
}

/**
 * Returns a safe href: allows http, https, mailto, tel, and hash-only links.
 * Falls back to "#" for anything else (e.g. javascript: URIs).
 */
export function sanitizeHref(href: string | null | undefined): string {
  if (typeof href !== "string" || !href) return "#";
  const trimmed = href.trim();
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    /^tel:/i.test(trimmed) ||
    /^#/.test(trimmed) ||
    /^\//.test(trimmed)
  ) {
    return trimmed;
  }
  return "#";
}
