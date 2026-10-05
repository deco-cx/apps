import { neutralizeUrlSchemes } from "./sanitizeHtml.ts";

/**
 * Stricter, dependency-free HTML sanitizer for blocks that render CMS-provided
 * markup in a table-like context (see Table.tsx). It is intentionally separate
 * from the shared `sanitizeHtml` so hardening this path cannot regress the many
 * other blocks that rely on the lighter sanitizer.
 *
 * On top of the shared sanitizer's guarantees it also:
 *  - Removes dangerous elements together with their content (script, style,
 *    iframe, object, embed, applet, form, svg, math, template, noscript, base,
 *    link, meta, frame, frameset), plus any leftover open/close/self-closing tags
 *  - Strips inline event-handler attributes (on*), srcdoc and inline style
 *
 * URL-scheme neutralization (javascript:, data:, vbscript:, including obfuscated
 * and unquoted forms) lives in `neutralizeUrlSchemes` and is shared with
 * `sanitizeHtml`, so both paths get the same guarantee.
 *
 * Note: this is a pragmatic denylist — not a full HTML parser. Keep the content
 * model simple (text + basic inline/formatting markup).
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

export function hardSanitize(raw: string | null | undefined): string {
  if (typeof raw !== "string" || !raw) return "";

  let html = raw;

  for (const tag of DANGEROUS_ELEMENTS) {
    // Remove the element with its content, then any stray open/close/self-closing tag.
    html = html
      .replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "")
      .replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"), "");
  }

  return neutralizeUrlSchemes(
    html
      // Inline event handlers (onclick, onerror, …)
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // srcdoc (smuggles an inline document into iframes) and inline styles
      .replace(/\s+(srcdoc|style)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, ""),
  );
}
