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
    // Dangerous protocols in url-bearing attributes — quoted and unquoted.
    .replace(
      new RegExp(
        `\\b(${URL_ATTRS})\\s*=\\s*"(?:${DANGEROUS_PROTOCOLS})[^"]*"`,
        "gi",
      ),
      '$1="#"',
    )
    .replace(
      new RegExp(
        `\\b(${URL_ATTRS})\\s*=\\s*'(?:${DANGEROUS_PROTOCOLS})[^']*'`,
        "gi",
      ),
      "$1='#'",
    )
    .replace(
      new RegExp(
        `\\b(${URL_ATTRS})\\s*=\\s*(?:${DANGEROUS_PROTOCOLS}):[^\\s>]*`,
        "gi",
      ),
      '$1="#"',
    );
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
