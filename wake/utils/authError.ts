import { context as decoContext } from "@deco/deco";

/**
 * Checks if an error is an authentication error and throws a user-friendly error
 * with development guidance if in development mode.
 */
export function handleAuthError(error: unknown, operationContext: string = "operation"): never {
  const errorObj = error as { message?: string; extensions?: { code?: string } };
  
  if (errorObj?.message?.includes("AUTH_NOT_AUTHENTICATED") ||
      errorObj?.extensions?.code === "AUTH_NOT_AUTHENTICATED" ||
      errorObj?.message?.includes("unauthorized")) {

    const isDev = !decoContext.isDeploy;
    if (isDev) {
      console.error(`
🔐 Wake API Authentication Error 🔐

Failed to ${operationContext} due to missing or invalid Wake API tokens.

This error occurs when:
- Wake Storefront Token is missing or invalid
- Wake API Token is missing or invalid  
- Tokens are configured but expired

To fix (Development):
1. Create a .env file in your project root
2. Add these environment variables:
   WAKE_TOKEN=your_storefront_token_here
   WAKE_KEY=your_api_token_here

To fix (Production):
1. Go to deco.cx admin
2. Find the Wake app configuration
3. Set up secrets for Storefront Token and API Token

For help: https://wakecommerce.readme.io/docs/storefront-api-criacao-e-autenticacao-do-token
      `);
    }

    // Throw a more user-friendly error for the frontend
    throw new Error("Authentication failed - Wake API tokens are missing or invalid");
  }

  // Re-throw if not an auth error
  throw error;
}

/**
 * Checks if an error is an authentication error without throwing
 */
export function isAuthError(error: unknown): boolean {
  const errorObj = error as { message?: string; extensions?: { code?: string } };
  
  return !!(errorObj?.message?.includes("AUTH_NOT_AUTHENTICATED") ||
           errorObj?.extensions?.code === "AUTH_NOT_AUTHENTICATED" ||
           errorObj?.message?.includes("unauthorized"));
}
