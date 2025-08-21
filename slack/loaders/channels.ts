import type { ChannelType, SlackChannel } from "../client.ts";
import type { AppContext } from "../mod.ts";
import {
  RateLimiter,
  type RetryOptions,
  withRetry,
} from "../utils/rateLimit.ts";

export interface Props {
  /**
   * @description Maximum number of channels to return (default 100, max 1000)
   * @default 100
   */
  limit?: number;
  /**
   * @description Pagination cursor for next page of results
   */
  cursor?: string;
  /**
   * @description Types of channels to return
   * @default ["public_channel"]
   */
  types?: ChannelType[];
  /**
   * @description Delay between requests in milliseconds when fetching all channels (default 1000ms)
   * @default 1000
   */
  delayBetweenRequests?: number;
  /**
   * @description Maximum number of retry attempts for rate limited requests (default 3)
   * @default 3
   */
  maxRetries?: number;
  /**
   * @description Base delay in milliseconds for exponential backoff (default 1000ms)
   * @default 1000
   */
  baseDelay?: number;
}

/**
 * @name LIST_CHANNELS
 * @title List Channels
 * @description Lists all public channels in the workspace with pagination and rate limiting protection
 */
export default async function listChannels(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ channels: SlackChannel[] }> {
  const {
    limit,
    cursor,
    types,
    delayBetweenRequests = 1000, // Default 1 second delay
    maxRetries = 3, // Default 3 retries
    baseDelay = 1000, // Default 1 second base delay
  } = props;
  const teamId = ctx.teamId;

  if (!teamId) {
    throw new Error(
      "Team ID is required. Please configure the Slack app with a valid team ID.",
    );
  }

  // Create retry options for this request
  const retryOptions: RetryOptions = {
    maxRetries,
    baseDelay,
    useExponentialBackoff: true,
  };

  if (!limit) {
    // Fetch all channels in loop with rate limiting
    const allChannels: SlackChannel[] = [];
    let nextCursor = cursor;
    let requestCount = 0;

    // Create a rate limiter based on delayBetweenRequests
    const rateLimiter = new RateLimiter(1000 / delayBetweenRequests); // Convert delay to requests per second

    while (true) {
      // Apply rate limiting (wait if necessary)
      if (requestCount > 0) {
        await rateLimiter.waitIfNeeded();
      }

      try {
        const response = await withRetry(
          () => ctx.slack.getChannels(teamId, 1000, nextCursor, types), // Use max limit of 1000 for efficiency
          retryOptions,
        );

        if (!response.channels) {
          console.warn("No channels returned from Slack API");
          break;
        }

        allChannels.push(...response.channels);
        nextCursor = response.response_metadata?.next_cursor;
        requestCount++;

        console.log(
          `Fetched ${response.channels.length} channels (total: ${allChannels.length})`,
        );

        if (!nextCursor || response.channels.length === 0) {
          break;
        }
      } catch (error) {
        console.error(
          `Failed to fetch channels after ${maxRetries + 1} attempts:`,
          error,
        );
        throw error;
      }
    }

    console.log(
      `Successfully fetched ${allChannels.length} total channels in ${requestCount} requests`,
    );
    return { channels: allChannels };
  }

  // Single request with retry logic
  try {
    return await withRetry(
      () => ctx.slack.getChannels(teamId, limit, cursor, types),
      retryOptions,
    );
  } catch (error) {
    console.error(`Failed to fetch channels:`, error);
    throw error;
  }
}
