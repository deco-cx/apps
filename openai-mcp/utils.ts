/**
 * Extracts the install ID from a URL pathname with the format:
 * /apps/OpenAI/7afa4147-0903-4416-a52a-c1f7d3b35762/mcp/messages
 *
 * @param url URL object or string representation of the URL
 * @returns The install ID from the pathname or null if not found
 */
export function getInstallId(url: URL | string): string | null {
  const pathName = typeof url === "string" ? url : url.pathname;

  // Match the UUID pattern in the pathname after /apps/OpenAI/
  const match = pathName.match(
    /\/apps\/OpenAI\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );

  return match ? match[1] : null;
}

/**
 * Creates a URL that will be used by the image preview loader
 */
export function createPreviewUrl(
  imageUrl: string,
  previewUrl: string,
  installId: string | null,
): string {
  // Construct preview URL with all necessary parameters
  return `${previewUrl}&imageUrl=${encodeURIComponent(imageUrl)}&installId=${
    installId || ""
  }`;
}
