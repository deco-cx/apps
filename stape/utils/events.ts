import { extractConsentFromHeaders, isAnyTrackingAllowed } from "./gdpr.ts";

// Type definitions for event handling
export interface EventResult {
  success: boolean;
  message: string;
}

export interface TrackingContext {
  hasConsent: boolean;
  clientId: string;
  userAgent: string;
  clientIp: string;
  pageUrl: string;
}

export interface ClientIdResult {
  clientId: string;
  source: "ga-cookie" | "stape-cookie" | "generated";
}

// Utility functions for event creation and result handling
export const createSuccessResult = (eventName: string): EventResult => ({
  success: true,
  message: `Event "${eventName}" sent successfully to Stape`,
});

export const createTimeoutResult = (timeoutMs: number = 5000): EventResult => ({
  success: false,
  message: `Request timeout after ${timeoutMs}ms`,
});

export const createErrorResult = (error: unknown): EventResult => ({
  success: false,
  message: error instanceof Error ? error.message : "Unknown error occurred",
});

export const isTimeoutError = (error: unknown): boolean =>
  error instanceof Error && error.name === "AbortError";

// Debug logging utilities with proper type safety
export const logDebugMessage = (
  debugMode: boolean | undefined,
  message: string,
  data?: unknown,
) => {
  if (debugMode) {
    console.log(message, data ? data : "");
  }
};

export const logDebugError = (
  debugMode: boolean | undefined,
  message: string,
  error?: unknown,
) => {
  if (debugMode) {
    console.error(message, error || "");
  }
};

// Cookie utilities (safe extraction without exposing sensitive data)
export const findCookieValue = (
  cookieHeader: string,
  cookieName: string,
): string | undefined =>
  cookieHeader
    .split("; ")
    .find((row) => row.startsWith(`${cookieName}=`))
    ?.split("=")[1];

// Client ID generation with privacy-safe extraction
export const extractClientIdFromGaCookie = (
  gaCookie: string,
): string | null => {
  const gaParts = gaCookie.split(".");
  return gaParts.length >= 3
    ? `${gaParts[2]}.${gaParts[3] || Date.now()}`
    : null;
};

export const generateClientId = (cookieHeader: string): ClientIdResult => {
  // Try GA cookie first (only extract client ID part, not personal data)
  const gaCookie = findCookieValue(cookieHeader, "_ga");
  if (gaCookie) {
    const clientId = extractClientIdFromGaCookie(gaCookie);
    if (clientId) {
      return { clientId, source: "ga-cookie" };
    }
  }

  // Try Stape client ID cookie
  const stapeClientId = findCookieValue(cookieHeader, "_stape_client_id");
  if (stapeClientId) {
    return { clientId: stapeClientId, source: "stape-cookie" };
  }

  // Generate new ID
  return { clientId: crypto.randomUUID(), source: "generated" };
};

// GDPR-compliant consent checking
export const hasTrackingConsent = (
  req: Request,
  enableGdprCompliance: boolean,
  consentCookieName: string,
): boolean => {
  if (!enableGdprCompliance) return true;

  const cookieHeader = req.headers.get("cookie") || "";
  const consentData = extractConsentFromHeaders(
    cookieHeader,
    consentCookieName,
  );
  return isAnyTrackingAllowed(consentData);
};

// Safe event validation (prevents injection attacks)
export const sanitizeEventName = (eventName: string): string => {
  // Only allow alphanumeric, underscore, and hyphen
  return eventName.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 50);
};

export const sanitizeEventParams = (
  params: Record<string, unknown>,
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    // Sanitize key names
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 50);

    if (safeKey && value !== undefined && value !== null) {
      // Only allow safe value types
      if (typeof value === "string") {
        sanitized[safeKey] = value.substring(0, 500); // Limit string length
      } else if (typeof value === "number" && isFinite(value)) {
        sanitized[safeKey] = value;
      } else if (typeof value === "boolean") {
        sanitized[safeKey] = value;
      }
      // Skip potentially dangerous types like objects, functions, etc.
    }
  }

  return sanitized;
};
