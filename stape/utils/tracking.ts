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

export const pseudonymizeIP = (ip: string): string => {
  if (!ip) return "unknown";
  try {
    const octets = ip.split(".");
    if (octets.length >= 3) {
      const partial = octets.slice(0, 3).join(".");
      const hash = btoa(ip).slice(-4);
      return `${partial}.xxx-${hash}`;
    }
    return "invalid-ip";
  } catch {
    return "pseudonym-error";
  }
};

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

export const buildTrackingContext = (
  req: Request,
  enableGdprCompliance: boolean,
  consentCookieName: string,
): TrackingContext => {
  const { userAgent, clientIp } = extractRequestInfo(req);

  const hasConsent = hasTrackingConsent(
    req,
    enableGdprCompliance,
    consentCookieName,
  );

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

export const createPageViewEvent = (
  context: TrackingContext,
  customParameters?: Record<string, string>,
  gtmContainerId?: string,
  userId?: string,
  hasConsent?: boolean,
) => {
  const url = new URL(context.pageUrl);
  SENSITIVE_QUERY_PARAMS.forEach((param) => url.searchParams.delete(param));

  const consentState = (hasConsent ?? context.hasConsent)
    ? "granted"
    : "denied";

  const safeCustomParameters = filterReservedKeys(customParameters || {});

  return {
    events: [{
      name: "page_view",
      params: {
        ...safeCustomParameters,
        page_location: url.toString(),
        page_title: "Server-Side Page View",
        page_referrer: "",
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

export const createBasicEventPayload = (
  eventName: string,
  eventParams: Record<string, unknown> = {},
  clientId?: string,
  userId?: string,
) => {
  const safeEventParams = filterReservedKeys(eventParams);

  return {
    events: [{
      name: eventName,
      params: {
        ...safeEventParams,
        timestamp_micros: Date.now() * 1000,
      },
    }],
    client_id: clientId || crypto.randomUUID(),
    user_id: userId,
    timestamp_micros: Date.now() * 1000,
  };
};

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
    console.error("Event sending failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
};

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
    return "";
  }
};
