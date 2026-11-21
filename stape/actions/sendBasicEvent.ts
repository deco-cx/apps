import { AppContext } from "../mod.ts";
import { fetchStapeAPI } from "../utils/fetch.ts";
import {
  createErrorResult,
  createSuccessResult,
  createTimeoutResult,
  type EventResult,
  isTimeoutError,
  sanitizeEventName,
  sanitizeEventParams,
} from "../utils/events.ts";
import { isRateLimited, validateStapeConfig } from "../utils/security.ts";
import {
  buildTrackingContext,
  createBasicEventPayload,
} from "../utils/tracking.ts";

// Request timeout configuration
const REQUEST_TIMEOUT_MS = 5000; // 5 seconds

export interface Props {
  /**
   * @title Event Name
   * @description Name of the event to send (e.g., page_view, custom_event)
   */
  eventName: string;

  /**
   * @title Event Parameters
   * @description Event parameters as JSON object
   */
  eventParams?: Record<string, unknown>;

  /**
   * @title Client ID
   * @description Client identifier for tracking
   */
  clientId?: string;

  /**
   * @title User ID
   * @description User identifier for cross-device tracking
   */
  userId?: string;
}

/**
 * @title Send Basic Event to Stape
 * @description Sends basic analytics events to Stape server-side container with security validation
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<EventResult> => {
  const { containerUrl } = ctx;

  // Security validation
  const configValidation = validateStapeConfig({ containerUrl });
  if (!configValidation.valid) {
    return createErrorResult(
      new Error(
        `Security validation failed: ${configValidation.errors.join(", ")}`,
      ),
    );
  }

  // Sanitize and validate inputs
  const safeEventName = sanitizeEventName(props.eventName);
  if (!safeEventName || safeEventName !== props.eventName) {
    return createErrorResult(new Error("Invalid event name format"));
  }

  const safeEventParams = sanitizeEventParams(props.eventParams || {});

  try {
    // Build tracking context with privacy protection
    const {
      enableGdprCompliance = true,
      consentCookieName = "cookie_consent",
    } = ctx;
    const trackingContext = buildTrackingContext(
      req,
      enableGdprCompliance,
      consentCookieName,
    );

    // Early return if no consent
    if (!trackingContext.hasConsent) {
      return createErrorResult(new Error("GDPR consent not granted"));
    }

    // Rate limiting check
    if (isRateLimited(trackingContext.clientId)) {
      return createErrorResult(new Error("Rate limit exceeded"));
    }

    // Create safe event payload
    const eventPayload = createBasicEventPayload(
      safeEventName,
      safeEventParams,
      props.clientId || trackingContext.clientId,
      props.userId,
    );

    // Send to Stape with timeout
    const result = await fetchStapeAPI(
      containerUrl!,
      eventPayload,
      trackingContext.userAgent,
      trackingContext.clientIp,
      REQUEST_TIMEOUT_MS,
    );

    return result.success
      ? createSuccessResult(safeEventName)
      : createErrorResult(result.error);
  } catch (error) {
    console.error("Failed to send event to Stape:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      // Don't log sensitive data
    });

    return isTimeoutError(error)
      ? createTimeoutResult()
      : createErrorResult(error);
  }
};

export default action;
