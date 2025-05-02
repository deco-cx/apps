/**
 * Extracts the install ID from a URL pathname with the format:
 * /apps/Vidu/7afa4147-0903-4416-a52a-c1f7d3b35762/mcp/messages
 *
 * @param url URL object or string representation of the URL
 * @returns The install ID from the pathname or null if not found
 */
export function getInstallId(url: URL | string): string | null {
  const pathName = typeof url === "string" ? url : url.pathname;

  // Match the UUID pattern in the pathname after /apps/Vidu/
  const match = pathName.match(
    /\/apps\/Vidu\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );

  return match ? match[1] : null;
}
