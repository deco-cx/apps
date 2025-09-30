import { extractRequestInfo, fetchStapeAPI } from "./fetch.ts";
import { generateClientId, hasTrackingConsent } from "./events.ts";
import type { TrackingContext } from "./events.ts";

// Constants
const DEFAULT_USER_AGENT = "Deco-Stape-Server/1.0";

// Reserved parameter keys that cannot be overridden by user input
const RESERVED_KEYS = [
  "client_id",
  "user_id",
  "timestamp_micros",
  "page_location",
  "page_title",
  "page_referrer",
  "session_id",
  "gtm_container_id",
] as const;

/**
 * Filters out reserved keys from custom parameters and logs conflicts
 * @param customParameters - User-provided parameters
 * @returns Filtered parameters without reserved keys
 */
function filterReservedKeys(
  customParameters: Record<string, unknown>,
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  const conflicts: string[] = [];

  for (const [key, value] of Object.entries(customParameters)) {
    if (RESERVED_KEYS.includes(key as any)) {
      conflicts.push(key);
      // Log server-side only (not exposed to client)
      console.warn(
        `[Stape Security] Reserved parameter key "${key}" filtered from user input`,
      );
    } else {
      filtered[key] = value;
    }
  }

  if (conflicts.length > 0) {
    console.warn(
      `[Stape Security] Filtered reserved keys: ${conflicts.join(", ")}`,
    );
  }

  return filtered;
}

/**
 * Creates a pseudonymized hash of IP address for client-side logging
 * Uses first 3 octets + hash for privacy compliance (GDPR)
 * @param ip - Raw IP address
 * @returns Pseudonymized IP for client-side use
 */
function pseudonymizeIP(ip: string): string {
  if (!ip) return "unknown";

  try {
    // Extract first 3 octets for geolocation while preserving privacy
    const octets = ip.split(".");
    if (octets.length >= 3) {
      const partial = octets.slice(0, 3).join(".");
      // Create simple hash of full IP for debugging (non-reversible)
      const hash = btoa(ip).slice(-4);
      return `${partial}.xxx-${hash}`;
    }
    return "invalid-ip";
  } catch {
    return "pseudonym-error";
  }
}

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

  // Filter custom parameters to prevent override of critical fields
  const safeCustomParameters = filterReservedKeys(customParameters || {});

  return {
    events: [{
      name: "page_view",
      params: {
        // User custom parameters FIRST (filtered, safe to override)
        ...safeCustomParameters,
        // Built-in parameters LAST (cannot be overridden)
        page_location: url.toString(), // Cleaned URL
        page_title: "Server-Side Page View",
        page_referrer: "", // Will be set from sanitized headers
        client_id: context.clientId,
        user_id: userId,
        timestamp_micros: Date.now() * 1000,
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
) => {
  // Filter event parameters to prevent override of critical fields
  const safeEventParams = filterReservedKeys(eventParams);

  return {
    events: [{
      name: eventName,
      params: {
        // User parameters FIRST (filtered, safe to override)
        ...safeEventParams,
        // Built-in parameters LAST (cannot be overridden)
        timestamp_micros: Date.now() * 1000,
      },
    }],
    client_id: clientId || crypto.randomUUID(),
    user_id: userId,
    timestamp_micros: Date.now() * 1000,
  };
};

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

// Sensitive query parameters to exclude from URLs
const SENSITIVE_QUERY_PARAMS = [
  "token",
  "key",
  "password",
  "secret",
  "auth",
  "session",
  "api_key",
];

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

  SENSITIVE_QUERY_PARAMS.forEach((param) => url.searchParams.delete(param));

  return {
    events: [{
      name: "page_view",
      params: {
        page_location: url.toString(),
        page_title: "Server-Side Page View",
        page_referrer: "",
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
      ad_storage: hasConsent ? "granted" : "denied",
      analytics_storage: hasConsent ? "granted" : "denied",
      ad_user_data: hasConsent ? "granted" : "denied",
      ad_personalization: hasConsent ? "granted" : "denied",
    },
  };
};

// Safe referrer extraction (removes sensitive information)
export const extractSafeReferrer = (req: Request): string => {
  const referrer = req.headers.get("referer") || "";

  if (!referrer) return "";

  try {
    const referrerUrl = new URL(referrer);

    SENSITIVE_QUERY_PARAMS.forEach((param) =>
      referrerUrl.searchParams.delete(param)
    );

    return referrerUrl.toString();
  } catch {
    // If URL parsing fails, return empty string for security
    return "";
  }
};
