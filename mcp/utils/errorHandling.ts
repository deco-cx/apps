import { HttpError } from "../../utils/http.ts";
import { logger } from "@deco/deco/o11y";

export interface ErrorWithStatus {
  status: number;
  message: string;
}

export interface ErrorMessageMap {
  [errorCode: string]: string;
}

export interface ErrorHandlerOptions {
  errorMessages: ErrorMessageMap;
  defaultErrorMessage?: string;
  defaultErrorStatus?: number;
  messageProcessor?: (message: string) => string;
}

export interface ErrorHandler {
  /**
   * Convert any error to a HttpError and throw it
   * @param error The error to be converted and thrown
   * @param defaultMessage The default message to be used if it's not possible to extract from the error
   * @param defaultStatus The default HTTP status (default: 500)
   * @param logPrefix Optional prefix for the log message
   * @throws HttpError Always throws a HttpError
   */
  toHttpError: (
    error: unknown,
    defaultMessage?: string,
    defaultStatus?: number,
    logPrefix?: string,
  ) => never;
}

export function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
  return (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    "message" in error &&
    typeof (error as ErrorWithStatus).status === "number" &&
    typeof (error as ErrorWithStatus).message === "string"
  );
}

function formatErrorMessage(message: string): string {
  let formatted = message.replace(/\s+/g, " ").trim();

  formatted = formatted.replace(/Error:\s+Error:\s+/g, "Error: ");

  ["Error:", "Exception:", "Failed:"].forEach((prefix) => {
    if (formatted.startsWith(prefix)) {
      formatted = formatted.substring(prefix.length).trim();
    }
  });

  return formatted;
}

/**
 * Creates a custom error handler
 * @param options Options for the error handler
 * @returns A custom error handler
 */
export function createErrorHandler(options: ErrorHandlerOptions): ErrorHandler {
  const {
    errorMessages,
    defaultErrorMessage = "Unknown error occurred",
    defaultErrorStatus = 500,
    messageProcessor = formatErrorMessage,
  } = options;

  const extractCleanErrorMessage = (
    message: string,
  ): { message: string; status?: number } => {
    try {
      const trimmedMessage = message.trim().replace(/^["'](.*)["']$/, "$1");

      const parsed = JSON.parse(trimmedMessage);

      if (parsed.error && typeof parsed.error === "object") {
        let errorMessage = parsed.error.message || "";
        const errorStatus = parsed.error.code;

        if (parsed.error.status && errorMessages[parsed.error.status]) {
          errorMessage = errorMessages[parsed.error.status];
        } else if (
          parsed.error.status && !errorMessage.includes(parsed.error.status)
        ) {
          errorMessage = `${errorMessage} (${parsed.error.status})`;
        }

        return {
          message: errorMessage,
          status: errorStatus || undefined,
        };
      }

      if (parsed.message) {
        return {
          message: parsed.message,
          status: parsed.status || parsed.code || undefined,
        };
      }

      return { message: messageProcessor(trimmedMessage) };
    } catch {
      return { message: messageProcessor(message) };
    }
  };

  const toHttpError = (
    error: unknown,
    defaultMessage = defaultErrorMessage,
    defaultStatus = defaultErrorStatus,
    logPrefix?: string,
  ): never => {
    if (logPrefix) {
      logger.error(`${logPrefix}:`, error);
    }

    if (isErrorWithStatus(error)) {
      const { message, status } = typeof error.message === "string"
        ? extractCleanErrorMessage(error.message)
        : { message: String(error.message), status: error.status };

      throw new HttpError(status || error.status, message);
    }

    if (error instanceof Error) {
      const { message, status } = extractCleanErrorMessage(error.message);
      throw new HttpError(status || defaultStatus, message);
    }

    if (typeof error === "string") {
      const { message, status } = extractCleanErrorMessage(error);
      throw new HttpError(status || defaultStatus, message);
    }

    throw new HttpError(defaultStatus, defaultMessage);
  };

  return {
    toHttpError,
  };
}

const DEFAULT_ERROR_MESSAGES: ErrorMessageMap = {
  "PERMISSION_DENIED": "Access denied. Please verify your permissions.",
  "NOT_FOUND": "Resource not found.",
  "INVALID_ARGUMENT": "Invalid argument. Please check your parameters.",
  "FAILED_PRECONDITION": "Operation not allowed in the current state.",
  "RESOURCE_EXHAUSTED": "Request limit exceeded. Please try again later.",
  "UNAUTHENTICATED": "Authentication failed. Please check your credentials.",
  "QUOTA_EXCEEDED": "API quota exceeded. Please try again later.",
  "ALREADY_EXISTS": "The resource already exists.",
  "DEADLINE_EXCEEDED": "The operation timed out. Please try again.",
  "UNAVAILABLE": "Service temporarily unavailable. Please try again later.",
};

export const defaultErrorHandler = createErrorHandler({
  errorMessages: DEFAULT_ERROR_MESSAGES,
});

export const {
  toHttpError,
} = defaultErrorHandler;
