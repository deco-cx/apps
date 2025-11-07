/**
 * Metadata for paginated responses
 */
export interface ResponseMetadata {
  /**
   * Total count of items (when available from API)
   */
  total_count?: number;
  /**
   * Unique count of items (e.g., unique clones, unique views)
   */
  uniques?: number;
  /**
   * Current page number
   */
  page?: number;
  /**
   * Number of items per page
   */
  per_page?: number;
  /**
   * Indicates if there are more pages available
   */
  has_next_page?: boolean;
}

/**
 * Standard response wrapper for list endpoints
 * Ensures MCP protocol compatibility by wrapping arrays in objects
 */
export interface StandardResponse<T> {
  /**
   * Array of items returned by the API
   */
  data: T[];
  /**
   * Pagination and response metadata
   */
  metadata: ResponseMetadata;
}

/**
 * Standard response wrapper for single object endpoints
 * Ensures MCP protocol compatibility and consistency with list endpoints
 */
export interface SingleObjectResponse<T> {
  /**
   * Single object returned by the API
   */
  data: T;
  /**
   * Response metadata
   */
  metadata: ResponseMetadata;
}

/**
 * Helper function to create a standard response
 */
export function createStandardResponse<T>(
  data: T[],
  metadata: Partial<ResponseMetadata> = {},
): StandardResponse<T> {
  return {
    data,
    metadata: {
      page: metadata.page,
      per_page: metadata.per_page,
      total_count: metadata.total_count,
      uniques: metadata.uniques,
      has_next_page: metadata.has_next_page,
    },
  };
}

/**
 * Helper function to create a single object response
 */
export function createSingleObjectResponse<T>(
  data: T,
  metadata: Partial<ResponseMetadata> = {},
): SingleObjectResponse<T> {
  return {
    data,
    metadata: {
      page: metadata.page,
      per_page: metadata.per_page,
      total_count: metadata.total_count,
      uniques: metadata.uniques,
      has_next_page: metadata.has_next_page,
    },
  };
}

/**
 * Extracts the has_next_page indicator from the Link header
 *
 * GitHub API includes a "Link" header with pagination info when there are more pages.
 * This header is the most reliable source for detecting pagination, as it correctly
 * handles edge cases like the last page being exactly full (per_page items).
 *
 * Example Link header:
 * <https://api.github.com/...?page=2>; rel="next", <https://api.github.com/...?page=5>; rel="last"
 *
 * Behavior:
 * - Returns true if rel="next" is present (more pages available)
 * - Returns undefined if Link header is absent (cannot determine reliably)
 *
 * Note: Callers should provide a fallback logic (e.g., array.length === per_page)
 * if the Link header is not available, as some older API responses may omit it.
 *
 * @param linkHeader The Link header value from the response (optional)
 * @returns true if a rel="next" relation is present; undefined if header is absent
 */
export function hasNextPageFromLinkHeader(
  linkHeader?: string | null,
): boolean | undefined {
  if (!linkHeader) return undefined;
  return /rel="next"/i.test(linkHeader);
}
