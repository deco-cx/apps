/**
 * Lightweight denylist-based HTML sanitizer that works in both Deno (SSR)
 * and browser contexts without external dependencies.
 *
 * Strips the most dangerous XSS vectors from CMS-provided HTML:
 *  - Dangerous elements together with their content (script, style, iframe,
 *    object, embed, applet, form, svg, math, template, noscript, base, link,
 *    meta, frame, frameset), plus any leftover open/close/self-closing tags
 *  - Inline event-handler attributes (on*)
 *  - srcdoc and inline style attributes
 *  - javascript:, data: and vbscript: protocols in url-bearing attributes
 *    (href, src, action, formaction, xlink:href), quoted or unquoted
 *
 * Note: this is a pragmatic, dependency-free denylist — not a full HTML parser.
 * Keep the content model simple (text + basic inline/formatting markup).
 */
const DANGEROUS_ELEMENTS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "applet",
  "form",
  "svg",
  "math",
  "template",
  "noscript",
  "base",
  "link",
  "meta",
  "frame",
  "frameset",
];

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
function hasDangerousScheme(value: string): boolean {
  const normalized = decodeEntities(value)
    // Control chars are intentional: browsers strip C0 controls/whitespace from
    // a URL scheme, so an attacker can hide one inside `javascript:`.
    // deno-lint-ignore no-control-regex
    .replace(/[\s\u0000-\u001f]+/g, "")
    .toLowerCase();
  return DANGEROUS_SCHEME_RE.test(normalized);
}

export function sanitizeHtml(raw: string | null | undefined): string {
  if (!raw) return "";

  let html = raw;

  for (const tag of DANGEROUS_ELEMENTS) {
    // Remove the element with its content, then any stray open/close/self-closing tag.
    html = html
      .replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "")
      .replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"), "");
  }

  return html
    // Inline event handlers (onclick, onerror, …)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // srcdoc (smuggles an inline document into iframes) and inline styles
    .replace(/\s+(srcdoc|style)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Neutralize dangerous protocols in url-bearing attributes. One pass handles
    // quoted and unquoted values identically: decode/normalize, then require a
    // real dangerous scheme followed by ":" (so harmless "data-*"/"javascriptX"
    // values are left intact).
    .replace(URL_ATTR_RE, (match, attr, value) => {
      const quote = value[0] === '"' || value[0] === "'" ? value[0] : "";
      const inner = quote ? value.slice(1, -1) : value;
      if (!hasDangerousScheme(inner)) return match;
      const q = quote || '"';
      return `${attr}=${q}#${q}`;
    });
}

/**
 * Returns a safe href: allows http, https, mailto, tel, and hash-only links.
 * Falls back to "#" for anything else (e.g. javascript: URIs).
 */
export function sanitizeHref(href: string | null | undefined): string {
  if (!href) return "#";
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
