import { context as decoContext } from "@deco/deco";

/**
 * Checks if an error is an authentication error and throws a user-friendly error
 * with development guidance if in development mode.
 */
export function handleAuthError(
  error: unknown,
  operationContext: string = "operation",
): never {
  const errorObj = error as {
    message?: string;
    extensions?: { code?: string };
  };

  if (
    errorObj?.message?.includes("AUTH_NOT_AUTHENTICATED") ||
    errorObj?.extensions?.code === "AUTH_NOT_AUTHENTICATED" ||
    errorObj?.message?.includes("unauthorized")
  ) {
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
    const authError = new Error(
      `Authentication failed (while trying to ${operationContext}) — Wake API tokens are missing or invalid`,
    );
    authError.cause = error;
    throw authError;
  }

  // Re-throw if not an auth error
  throw error;
}

/**
 * Checks if an error is an authentication error without throwing
 */
export function isAuthError(error: unknown): boolean {
  const errorObj = error as {
    message?: string;
    extensions?: { code?: string };
    status?: number;
    response?: { status?: number };
    errors?: Array<{ message?: string; extensions?: { code?: string } }>;
  };

  // Normalize text for case-insensitive comparison
  const msg = (errorObj?.message ?? "").toLowerCase();
  const code = (errorObj?.extensions?.code ?? "").toUpperCase();

  // Check HTTP status codes
  const httpStatus = errorObj?.status ?? errorObj?.response?.status;

  // Check for aggregate errors (multiple errors in an array)
  const isAggregate = Array.isArray(errorObj?.errors) &&
    errorObj.errors.some((e) =>
      String(e?.message ?? "").toLowerCase().includes("unauthorized") ||
      String(e?.extensions?.code ?? "").toUpperCase() === "UNAUTHENTICATED" ||
      String(e?.extensions?.code ?? "").toUpperCase() ===
        "AUTH_NOT_AUTHENTICATED" ||
      String(e?.extensions?.code ?? "").toUpperCase() === "FORBIDDEN"
    );

  return !!(
    msg.includes("auth_not_authenticated") ||
    msg.includes("unauthorized") ||
    msg.includes("forbidden") ||
    code === "AUTH_NOT_AUTHENTICATED" ||
    code === "UNAUTHENTICATED" ||
    code === "FORBIDDEN" ||
    httpStatus === 401 ||
    httpStatus === 403 ||
    isAggregate
  );
}
