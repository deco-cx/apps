/**
 * Sleep utility function for adding delays
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Options for the retry wrapper
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default 3) */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff (default 1000) */
  baseDelay?: number;
  /** Whether to use exponential backoff (default true) */
  useExponentialBackoff?: boolean;
  /** Custom predicate to determine if an error should trigger a retry */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Default retry predicate that handles common rate limiting scenarios
 */
const defaultShouldRetry = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes("429") ||
    message.includes("rate_limited") ||
    message.includes("ratelimited") ||
    message.includes("too many requests");
};

/**
 * Retry wrapper with exponential backoff for rate limiting
 * Specifically designed for Slack API interactions
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    useExponentialBackoff = true,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await operation();

      // Check if the response indicates rate limiting (for Slack API responses)
      if (typeof response === "object" && response !== null) {
        // deno-lint-ignore no-explicit-any
        const responseObj = response as any;

        // Handle Slack API error responses
        if ("ok" in responseObj && !responseObj.ok) {
          if (
            responseObj.error === "rate_limited" ||
            responseObj.error === "ratelimited"
          ) {
            if (attempt < maxRetries) {
              const delay = useExponentialBackoff
                ? baseDelay * Math.pow(2, attempt)
                : baseDelay;
              console.warn(
                `Rate limited by Slack API, retrying in ${delay}ms (attempt ${
                  attempt + 1
                }/${maxRetries + 1})`,
              );
              await sleep(delay);
              continue;
            }
            throw new Error(
              `Rate limited by Slack API after ${
                maxRetries + 1
              } attempts: ${responseObj.error}`,
            );
          }

          // Handle other Slack API errors that shouldn't be retried
          if (
            responseObj.error &&
            !defaultShouldRetry(new Error(responseObj.error))
          ) {
            throw new Error(`Slack API error: ${responseObj.error}`);
          }
        }
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (shouldRetry(lastError, attempt)) {
        if (attempt < maxRetries) {
          let delay: number;

          // Check for HTTP 429 with retry-after header
          const retryAfterMatch = lastError.message.match(
            /Retry after (\d+) seconds/,
          );
          if (retryAfterMatch) {
            // Use the retry-after header value + a small buffer
            delay = (parseInt(retryAfterMatch[1]) * 1000) + 1000; // Convert to ms and add 1s buffer
            console.warn(
              `HTTP 429 rate limit, retrying in ${delay}ms as suggested by retry-after header (attempt ${
                attempt + 1
              }/${maxRetries + 1})`,
            );
          } else {
            // Use exponential backoff or fixed delay
            delay = useExponentialBackoff
              ? baseDelay * Math.pow(2, attempt)
              : baseDelay;
            console.warn(
              `Retrying operation in ${delay}ms (attempt ${attempt + 1}/${
                maxRetries + 1
              }): ${lastError.message}`,
            );
          }

          await sleep(delay);
          continue;
        }
      }

      // If it's not a retryable error or we've exhausted retries, throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // For other errors that might be transient, wait a bit before retrying
      const delay = useExponentialBackoff
        ? baseDelay * Math.pow(2, attempt)
        : baseDelay;
      console.warn(
        `Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${
          maxRetries + 1
        }): ${lastError.message}`,
      );
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Rate limiter for controlling request frequency
 */
export class RateLimiter {
  private lastRequestTime = 0;
  private readonly minInterval: number;

  constructor(requestsPerSecond: number = 1) {
    this.minInterval = 1000 / requestsPerSecond; // Convert to milliseconds
  }

  /**
   * Wait if necessary to respect rate limiting
   */
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
  }
}
