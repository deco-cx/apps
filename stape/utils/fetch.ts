export interface FetchWithTimeoutOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface FetchResult {
  success: boolean;
  status?: number;
  statusText?: string;
  data?: string;
  error?: string;
}

/**
 * Default configurations for requests
 */
export const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds
export const DEFAULT_STAPE_TIMEOUT_MS = 5000; // 5 seconds for Stape API

/**
 * Makes an HTTP request with timeout and robust error handling
 * Includes response body in errors for debugging
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
): Promise<FetchResult> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  // Setup timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    // Clear timeout on successful response
    clearTimeout(timeoutId);

    // Check if response is ok
    if (!response.ok) {
      // Get response body for debugging
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        errorBody = "Unable to read response body";
      }

      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        error:
          `HTTP ${response.status}: ${response.statusText}. Response: ${errorBody}`,
      };
    }

    // Get response data
    const data = await response.text();

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      data,
    };
  } catch (error) {
    // Clear timeout on error
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: `Request timeout after ${timeoutMs}ms`,
        };
      }
      return {
        success: false,
        error: `Network error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "Unknown network error occurred",
    };
  }
}

/**
 * Makes a POST request to Stape with optimized configurations
 * Includes default headers and Stape-specific timeout
 */
export function fetchStapeAPI(
  containerUrl: string,
  payload: unknown,
  userAgent: string = "Deco-Stape/1.0",
  clientIp: string = "127.0.0.1",
  timeoutMs: number = DEFAULT_STAPE_TIMEOUT_MS,
): Promise<FetchResult> {
  const stapeUrl = new URL("/gtm", containerUrl);

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": userAgent,
    "X-Forwarded-For": clientIp,
    "X-Real-IP": clientIp,
  };

  return fetchWithTimeout(stapeUrl.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    timeoutMs,
  });
}

/**
 * Helper to extract HTTP request information
 */
export function extractRequestInfo(req: Request): {
  userAgent: string;
  clientIp: string;
  forwardedIps: string[];
} {
  const userAgent = req.headers.get("user-agent") || "Unknown";
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const realIp = req.headers.get("x-real-ip") || "";

  const forwardedIps = forwarded
    ? forwarded.split(",").map((ip) => ip.trim()).filter(Boolean)
    : [];

  if (realIp && !forwardedIps.includes(realIp)) {
    forwardedIps.push(realIp);
  }

  const clientIp = forwardedIps[0] || "127.0.0.1";

  return {
    userAgent,
    clientIp,
    forwardedIps,
  };
}
