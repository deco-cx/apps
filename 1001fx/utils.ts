/**
 * Extracts the install ID from a URL pathname with the format:
 * /apps/1001fx/7afa4147-0903-4416-a52a-c1f7d3b35762/mcp/messages
 *
 * @param url URL object or string representation of the URL
 * @returns The install ID from the pathname or null if not found
 */
export function getInstallId(url: URL | string): string | null {
  const pathName = typeof url === "string" ? url : url.pathname;

  // Match the UUID pattern in the pathname after /apps/1001fx/
  const match = pathName.match(
    /\/apps\/1001fx\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );

  return match ? match[1] : null;
}

/**
 * Helper function to validate a URL
 *
 * @param url URL to validate
 * @returns boolean indicating if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to validate images array
 *
 * @param images Array of image configs to validate
 * @returns boolean indicating if images array is valid
 */
export function validateImages(
  images: Array<{ imageUrl: string; duration: number }>,
): boolean {
  if (!Array.isArray(images) || images.length < 1 || images.length > 10) {
    return false;
  }

  return images.every((img) =>
    typeof img === "object" &&
    isValidUrl(img.imageUrl) &&
    typeof img.duration === "number" &&
    img.duration > 0
  );
}
