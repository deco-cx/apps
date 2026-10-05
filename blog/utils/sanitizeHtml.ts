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

const TAG_START_RE = /[a-z]/i;
// Captures a url-bearing attribute and its value (double/single-quoted or bare).
// The name must be whole: `\b` would also match inside `data-href`, whose value
// a browser never navigates to.
const URL_ATTR_RE = new RegExp(
  `(?<![\\w-])(${URL_ATTRS})\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`,
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
 * Applies `replacer` to every element start tag, leaving text nodes untouched.
 *
 * Hand-scanned rather than matched with a regex: the tag body has to track
 * quote state (a ">" inside an attribute value does not end the tag) and still
 * cope with an unterminated value, and every regex shaped that way either
 * misses one of those cases or backtracks catastrophically. This walk is a
 * single linear pass.
 */
function replaceInStartTags(
  html: string,
  replacer: (tag: string) => string,
): string {
  let out = "";
  let i = 0;

  while (i < html.length) {
    const start = html.indexOf("<", i);
    if (start === -1) {
      out += html.slice(i);
      break;
    }
    out += html.slice(i, start);

    // Only element start tags carry attributes; "</a>", "<!--" and a bare "<"
    // are copied through.
    if (!TAG_START_RE.test(html[start + 1] ?? "")) {
      out += "<";
      i = start + 1;
      continue;
    }

    let end = start + 1;
    let quote = "";
    for (; end < html.length; end++) {
      const char = html[end];
      if (quote) {
        if (char === quote) quote = "";
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === ">") {
        end++;
        break;
      }
    }

    // An unterminated tag runs to the end of the input — still scanned, since a
    // browser may yet close the value and act on the attribute.
    out += replacer(html.slice(start, end));
    i = end;
  }

  return out;
}

/**
 * Points every url-bearing attribute carrying a dangerous scheme at "#". Quoted
 * and unquoted values are handled identically — an unquoted
 * `href=javascript:alert(1)` is just as executable as a quoted one — while
 * harmless values like "data-*" or "javascriptX" are left intact.
 *
 * Only start tags are scanned, so prose and code samples that merely *mention*
 * `href=javascript:` (escaped as `&lt;a href=javascript:…&gt;`) are not rewritten.
 */
export function neutralizeUrlSchemes(html: string): string {
  return replaceInStartTags(
    html,
    (tag) =>
      tag.replace(URL_ATTR_RE, (match, attr, value) => {
        const quote = value[0] === '"' || value[0] === "'" ? value[0] : "";
        const inner = quote ? value.slice(1, -1) : value;
        if (!hasDangerousScheme(inner)) return match;
        const q = quote || '"';
        return `${attr}=${q}#${q}`;
      }),
  );
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
