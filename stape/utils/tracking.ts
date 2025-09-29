import { extractRequestInfo, fetchStapeAPI } from "./fetch.ts";
import { generateClientId, hasTrackingConsent } from "./events.ts";
import type { TrackingContext } from "./events.ts";

// Constants
const DEFAULT_USER_AGENT = "Deco-Stape-Server/1.0";

// Tracking context builder with privacy-safe data extraction
export const buildTrackingContext = (
  req: Request,
  enableGdprCompliance: boolean,
  consentCookieName: string,
): TrackingContext => {
  const { userAgent, clientIp } = extractRequestInfo(req);

  // Check consent first
  const hasConsent = hasTrackingConsent(
    req,
    enableGdprCompliance,
    consentCookieName,
  );

  // Generate client ID only if we have consent
  const cookieHeader = hasConsent ? (req.headers.get("cookie") || "") : "";
  const { clientId } = hasConsent
    ? generateClientId(cookieHeader)
    : { clientId: crypto.randomUUID() };

  return {
    hasConsent,
    clientId,
    userAgent: userAgent || DEFAULT_USER_AGENT,
    clientIp,
    pageUrl: req.url,
  };
};

// Safe page view event creation (no sensitive data leakage)
export const createPageViewEvent = (
  context: TrackingContext,
  customParameters?: Record<string, string>,
  gtmContainerId?: string,
  userId?: string,
  hasConsent?: boolean,
) => {
  // Parse URL to remove sensitive query parameters
  const url = new URL(context.pageUrl);

  // Remove potentially sensitive query parameters
  const sensitiveParams = [
    "token",
    "key",
    "password",
    "secret",
    "auth",
    "session",
    "api_key",
  ];
  sensitiveParams.forEach((param) => url.searchParams.delete(param));

  const consentState = (hasConsent ?? context.hasConsent)
    ? "granted"
    : "denied";

  return {
    events: [{
      name: "page_view",
      params: {
        page_location: url.toString(), // Cleaned URL
        page_title: "Server-Side Page View",
        page_referrer: "", // Will be set from sanitized headers
        client_id: context.clientId,
        user_id: userId,
        timestamp_micros: Date.now() * 1000,
        ...customParameters,
      },
    }],
    gtm_container_id: gtmContainerId,
    client_id: context.clientId,
    user_id: userId,
    consent: {
      ad_storage: consentState,
      analytics_storage: consentState,
      ad_user_data: consentState,
      ad_personalization: consentState,
    },
  };
};

// Safe event payload creation for basic events
export const createBasicEventPayload = (
  eventName: string,
  eventParams: Record<string, unknown> = {},
  clientId?: string,
  userId?: string,
) => ({
  events: [{
    name: eventName,
    params: {
      timestamp_micros: Date.now() * 1000,
      ...eventParams,
    },
  }],
  client_id: clientId || crypto.randomUUID(),
  user_id: userId,
  timestamp_micros: Date.now() * 1000,
});

// Safe event sending with timeout and error handling
export const sendEventSafely = async (
  containerUrl: string,
  eventPayload: unknown,
  context: TrackingContext,
  timeoutMs: number = 5000,
) => {
  try {
    const result = await fetchStapeAPI(
      containerUrl,
      eventPayload,
      context.userAgent,
      context.clientIp,
      timeoutMs,
    );

    return result;
  } catch (error) {
    // Log error without exposing sensitive data
    console.error("Event sending failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      // Don't log container URL or other sensitive info
    });

    throw error;
  }
};

// Safe referrer extraction (removes sensitive information)
export const extractSafeReferrer = (req: Request): string => {
  const referrer = req.headers.get("referer") || "";

  if (!referrer) return "";

  try {
    const referrerUrl = new URL(referrer);

    // Remove sensitive query parameters from referrer
    const sensitiveParams = [
      "token",
      "key",
      "password",
      "secret",
      "auth",
      "session",
      "api_key",
    ];
    sensitiveParams.forEach((param) => referrerUrl.searchParams.delete(param));

    return referrerUrl.toString();
  } catch {
    // If URL parsing fails, return empty string for security
    return "";
  }
};
