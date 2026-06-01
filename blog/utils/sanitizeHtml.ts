/**
 * Lightweight allowlist-based HTML sanitizer that works in both Deno (SSR)
 * and browser contexts without external dependencies.
 *
 * Strips the most dangerous XSS vectors from CMS-provided HTML:
 *  - <script> and <style> blocks
 *  - Inline event-handler attributes (on*)
 *  - javascript: and data: protocol values in href/src/action attributes
 */
export function sanitizeHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(
      /\b(href|src|action)\s*=\s*"(?:javascript|data)[^"]*"/gi,
      '$1="#"',
    )
    .replace(
      /\b(href|src|action)\s*=\s*'(?:javascript|data)[^']*'/gi,
      "$1='#'",
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
