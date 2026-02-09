import { createHttpClient, type HttpClientOptions } from "../../utils/http.ts";

/**
 * Sanitize string values to prevent path traversal attacks
 */
function sanitizeString(value: string): string {
  const original = value;
  const sanitized = value
    .replace(/\.\./g, "")           // Remove ..
    .replace(/[\/\\]/g, "")         // Remove / and \
    .replace(/\0/g, "")             // Remove null bytes
    .replace(/%2e%2e/gi, "")        // Remove URL encoded ..
    .replace(/%2f/gi, "")           // Remove URL encoded /
    .replace(/%5c/gi, "")           // Remove URL encoded \
    .trim();
  
  if (sanitized !== original) {
    console.warn("[SECURITY] Path traversal attempt blocked:", {
      original,
      sanitized,
      timestamp: new Date().toISOString(),
    });
  }
  
  return sanitized;
}

/**
 * Recursively sanitize all parameters to prevent path traversal
 */
function sanitizeParams<T>(params: T): T {
  if (typeof params === "string") {
    return sanitizeString(params) as T;
  }
  
  if (Array.isArray(params)) {
    return params.map(sanitizeParams) as T;
  }
  
  if (params && typeof params === "object") {
    const sanitized = {} as T;
    for (const [key, value] of Object.entries(params)) {
      (sanitized as any)[key] = sanitizeParams(value);
    }
    return sanitized;
  }
  
  return params;
}

/**
 * Create a secure HTTP client that automatically sanitizes all parameters
 * to prevent path traversal attacks.
 * 
 * @example
 * ```typescript
 * const vcs = createSecureHttpClient<VCS>({
 *   base: publicUrl,
 *   headers: headers,
 * });
 * 
 * // All calls are automatically protected:
 * vcs["GET /api/catalog/:id"]({ id: "../../../../" })
 * // => { id: "" } (path traversal blocked)
 * ```
 */
export function createSecureHttpClient<T>(config: HttpClientOptions) {
  const client = createHttpClient<T>(config);
  
  return new Proxy(client, {
    get: (target, prop) => {
      const value = target[prop as keyof typeof target];
      return typeof value === "function" 
        ? (params?: unknown) => value.call(target, sanitizeParams(params))
        : value;
    },
  });
}