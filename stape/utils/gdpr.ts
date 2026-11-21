// GDPR Consent Management Utilities
// Baseado na documentação oficial do Google Consent Mode
// https://support.google.com/analytics/answer/9976101

import { GdprConsentData } from "./types.ts";

/**
 * Helper function to create default consent data (denied por GDPR compliance)
 * Default seguro que garante compliance até que o usuário dê consentimento explícito
 */
export function createDefaultConsentData(): GdprConsentData {
  return {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

/**
 * Helper function to create granted consent
 * Usado quando o usuário aceita todos os tipos de cookies/tracking
 */
export function createGrantedConsent(): GdprConsentData {
  return {
    ad_storage: "granted",
    analytics_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  };
}

/**
 * Helper function to create denied consent
 * Usado quando o usuário rejeita todos os tipos de cookies/tracking
 */
export function createDeniedConsent(): GdprConsentData {
  return {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

/**
 * Parse consent cookie value and return structured consent data
 * Suporta diferentes formatos de cookies de consentimento
 */
export function parseConsentCookie(
  cookieValue: string | undefined,
): GdprConsentData {
  if (!cookieValue) {
    return createDefaultConsentData();
  }

  let parsedConsent: unknown = null;

  try {
    // Try to parse as JSON first
    parsedConsent = JSON.parse(decodeURIComponent(cookieValue.trim()));
  } catch {
    // Fallback to string/boolean parsing
    const normalizedValue = cookieValue.trim().toLowerCase();
    if (normalizedValue === "true" || normalizedValue === "granted") {
      return createGrantedConsent();
    } else if (normalizedValue === "false" || normalizedValue === "denied") {
      return createDeniedConsent();
    }
  }

  if (parsedConsent === true || parsedConsent === "granted") {
    return createGrantedConsent();
  } else if (parsedConsent === false || parsedConsent === "denied") {
    return createDeniedConsent();
  } else if (typeof parsedConsent === "object" && parsedConsent !== null) {
    // Handle object-based consent
    const consentObj = parsedConsent as Record<string, string>;
    return {
      ad_storage: (consentObj.ad_storage === "granted") ? "granted" : "denied",
      analytics_storage: (consentObj.analytics_storage === "granted")
        ? "granted"
        : "denied",
      ad_user_data: (consentObj.ad_user_data === "granted")
        ? "granted"
        : "denied",
      ad_personalization: (consentObj.ad_personalization === "granted")
        ? "granted"
        : "denied",
    };
  }

  // Default fallback
  return createDefaultConsentData();
}

/**
 * Extract consent from HTTP cookie header
 * Extrai e parse o cookie de consentimento do header HTTP
 */
export function extractConsentFromHeaders(
  cookieHeader: string,
  consentCookieName: string = "cookie_consent",
): GdprConsentData {
  const cookieMap = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.split("=");
      return [k.trim(), decodeURIComponent(v.join("=") || "")];
    }),
  );

  const consentValue = cookieMap[consentCookieName];
  return parseConsentCookie(consentValue);
}

/**
 * Check if analytics tracking is allowed based on consent
 * Verifica se analytics pode ser usado baseado no consentimento
 */
export function isAnalyticsAllowed(consent: GdprConsentData): boolean {
  return consent.analytics_storage === "granted";
}

/**
 * Check if advertising tracking is allowed based on consent
 * Verifica se publicidade pode ser usada baseada no consentimento
 */
export function isAdvertisingAllowed(consent: GdprConsentData): boolean {
  return consent.ad_storage === "granted";
}

/**
 * Check if any tracking is allowed based on consent
 * Verifica se qualquer tipo de tracking é permitido
 */
export function isAnyTrackingAllowed(consent: GdprConsentData): boolean {
  return consent.analytics_storage === "granted" ||
    consent.ad_storage === "granted";
}
