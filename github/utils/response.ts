/**
 * Metadata for paginated responses
 */
export interface ResponseMetadata {
  /**
   * Total count of items (when available from API)
   */
  total_count?: number;
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
      has_next_page: metadata.has_next_page,
    },
  };
}
