import { HttpError } from "./http.ts";
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
   * Converte qualquer erro para um HttpError e o lança imediatamente
   * @param error O erro a ser convertido e lançado
   * @param defaultMessage Mensagem padrão a ser usada se não for possível extrair do erro
   * @param defaultStatus Status HTTP padrão (default: 500)
   * @param logPrefix Prefixo opcional para a mensagem de log
   * @throws HttpError Sempre lança um HttpError
   */
  toHttpError: (
    error: unknown,
    defaultMessage?: string,
    defaultStatus?: number,
    logPrefix?: string,
  ) => never;

  /**
   * Converte qualquer erro para um objeto de resposta de erro padronizado
   * @param error O erro a ser convertido
   * @param logPrefix Prefixo opcional para a mensagem de log
   * @returns Objeto com formato { success: false, error: string }
   */
  toErrorResponse: (
    error: unknown,
    logPrefix?: string,
  ) => { success: false; error: string };
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
        : { message: String(error.message) };

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

  const toErrorResponse = (
    error: unknown,
    logPrefix?: string,
  ): { success: false; error: string } => {
    if (logPrefix) {
      logger.error(`${logPrefix}:`, error);
    }

    let errorMessage: string;

    if (isErrorWithStatus(error)) {
      const { message } = typeof error.message === "string"
        ? extractCleanErrorMessage(error.message)
        : { message: String(error.message) };
      errorMessage = message;
    } else if (error instanceof Error) {
      const { message } = extractCleanErrorMessage(error.message);
      errorMessage = message;
    } else if (typeof error === "string") {
      const { message } = extractCleanErrorMessage(error);
      errorMessage = message;
    } else {
      errorMessage = defaultErrorMessage;
    }

    return {
      success: false,
      error: errorMessage,
    };
  };

  const _processResponseError = async (
    response: Response,
    defaultMessage = "Request failed",
  ): Promise<{ success: false; error: string } | undefined> => {
    if (response.ok) return undefined;

    try {
      const text = await response.text();

      const { message } = extractCleanErrorMessage(text);

      if (message && message.trim().length > 0) {
        return {
          success: false,
          error: message,
        };
      }
    } catch {
      logger.error("Error processing response:", response);
    }

    return {
      success: false,
      error: response.statusText || defaultMessage,
    };
  };

  return {
    toHttpError,
    toErrorResponse,
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
  toErrorResponse,
} = defaultErrorHandler;
