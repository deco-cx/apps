/**
 * Decodes a base64-encoded state parameter from OAuth flow
 * @param state - The base64-encoded state string
 * @returns The decoded state object or empty object if decoding fails
 */
export function decodeState(state: string): Record<string, unknown> {
  try {
    const decoded = atob(decodeURIComponent(state));
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

/**
 * Type-safe version of decodeState for custom bot state
 * SECURITY: No longer stores secrets in state - uses session tokens instead
 */
export interface CustomBotState {
  customBotName?: string;
  isCustomBot?: boolean;
  sessionToken?: string; // Secure token for credential lookup
  debugMode?: boolean;
  [key: string]: unknown;
}

export function decodeCustomBotState(state: string): CustomBotState {
  return decodeState(state) as CustomBotState;
}

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  // Resolve whatever WebCrypto might be available, either on globalThis or as the legacy `crypto` global
  const webCrypto: Crypto | undefined = (typeof globalThis !== "undefined" &&
    (globalThis.crypto as Crypto | undefined)) ||
    (typeof crypto !== "undefined" ? (crypto as Crypto) : undefined);

  // Prefer crypto.randomUUID() when available
  if (webCrypto?.randomUUID) {
    return webCrypto.randomUUID();
  }

  // Ensure getRandomValues is available before falling back
  if (!webCrypto?.getRandomValues) {
    throw new Error(
      "Web Crypto API is not available; register a crypto polyfill before calling generateSessionToken().",
    );
  }

  // Fallback: fill 32 bytes of randomness and base64-URL-encode them
  const array = new Uint8Array(32);
  webCrypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Secure session store for custom bot credentials
 * In production, replace with Redis, Database, or other persistent store
 */
const sessionStore = new Map<string, {
  clientId: string;
  clientSecret: string;
  botName?: string;
  debugMode?: boolean;
  expiresAt: number;
}>();

/**
 * Store custom bot credentials securely with session token
 */
export function storeCustomBotSession(
  clientId: string,
  clientSecret: string,
  botName?: string,
  debugMode?: boolean,
): string {
  const sessionToken = generateSessionToken();
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes expiry

  sessionStore.set(sessionToken, {
    clientId,
    clientSecret,
    botName,
    debugMode,
    expiresAt,
  });

  return sessionToken;
}

/**
 * Retrieve custom bot credentials using session token
 */
export function retrieveCustomBotSession(sessionToken: string): {
  clientId: string;
  clientSecret: string;
  botName?: string;
  debugMode?: boolean;
} | null {
  const session = sessionStore.get(sessionToken);

  if (!session) {
    return null;
  }

  // Check expiration
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(sessionToken);
    return null;
  }

  // Don't delete on retrieval - allow multiple uses during OAuth flow
  // Will be cleaned up by expiration
  return {
    clientId: session.clientId,
    clientSecret: session.clientSecret,
    botName: session.botName,
    debugMode: session.debugMode,
  };
}

/**
 * Invalidate a session token (call after successful OAuth)
 */
export function invalidateSession(sessionToken: string): void {
  sessionStore.delete(sessionToken);
}

/**
 * Clean up expired sessions (should be called periodically)
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessionStore.entries()) {
    if (now > session.expiresAt) {
      sessionStore.delete(token);
    }
  }
}
