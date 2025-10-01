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
 */
export interface CustomBotState {
  customClientSecret?: string;
  customBotName?: string;
  isCustomBot?: boolean;
  [key: string]: unknown;
}

export function decodeCustomBotState(state: string): CustomBotState {
  return decodeState(state) as CustomBotState;
}
