// Security validation utilities for Stape integration

// Input validation functions
export const isValidContainerUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow HTTPS for security
    return parsedUrl.protocol === "https:" &&
      parsedUrl.hostname.length > 0 &&
      !parsedUrl.hostname.includes("localhost") &&
      !parsedUrl.hostname.includes("127.0.0.1");
  } catch {
    return false;
  }
};

export const isValidApiKey = (apiKey: string): boolean => {
  // API key should be non-empty and not contain obvious placeholders
  return typeof apiKey === "string" &&
    apiKey.length > 10 &&
    !apiKey.includes("your-api-key") &&
    !apiKey.includes("placeholder") &&
    !apiKey.includes("example");
};

export const isValidEventName = (eventName: string): boolean => {
  // Event name should follow GA4 conventions
  return typeof eventName === "string" &&
    eventName.length > 0 &&
    eventName.length <= 50 &&
    /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(eventName);
};

// Data sanitization functions
export const sanitizeHeaders = (headers: Headers): Record<string, string> => {
  const safe: Record<string, string> = {};

  // Only allow specific safe headers
  const allowedHeaders = [
    "user-agent",
    "accept-language",
    "content-type",
    "x-forwarded-for",
    "x-real-ip",
  ];

  allowedHeaders.forEach((header) => {
    const value = headers.get(header);
    if (value) {
      safe[header] = value.substring(0, 200); // Limit header length
    }
  });

  return safe;
};

// Remove sensitive information from URLs
export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);

    // Remove sensitive query parameters
    const sensitiveParams = [
      "token",
      "key",
      "password",
      "secret",
      "auth",
      "session",
      "api_key",
      "access_token",
      "refresh_token",
      "jwt",
      "client_secret",
      "private_key",
      "credential",
    ];

    sensitiveParams.forEach((param) => {
      parsedUrl.searchParams.delete(param);
    });

    return parsedUrl.toString();
  } catch {
    // If URL parsing fails, return empty string for security
    return "";
  }
};

// Validate and sanitize user input
export const sanitizeUserInput = (
  input: string,
  maxLength: number = 100,
): string => {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>\"'&]/g, "") // Remove potentially dangerous characters
    .substring(0, maxLength)
    .trim();
};

// IP address validation and anonymization
export const anonymizeIp = (ip: string): string => {
  try {
    // For IPv4, zero out the last octet
    if (ip.includes(".")) {
      const parts = ip.split(".");
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
      }
    }

    // For IPv6, zero out the last 4 groups
    if (ip.includes(":")) {
      const parts = ip.split(":");
      if (parts.length >= 4) {
        return parts.slice(0, 4).join(":") + "::";
      }
    }

    return "127.0.0.1"; // Fallback to localhost
  } catch {
    return "127.0.0.1";
  }
};

// Validate configuration before use
export const validateStapeConfig = (config: {
  containerUrl?: string;
  apiKey?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.containerUrl) {
    errors.push("Container URL is required");
  } else if (!isValidContainerUrl(config.containerUrl)) {
    errors.push("Invalid container URL format or insecure protocol");
  }

  if (config.apiKey && !isValidApiKey(config.apiKey)) {
    errors.push("Invalid API key format");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Rate limiting utilities (prevent abuse)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const isRateLimited = (
  clientId: string,
  maxRequests: number = 100,
  windowMs: number = 60000,
): boolean => {
  const now = Date.now();
  const clientData = requestCounts.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    // Reset counter for new window
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (clientData.count >= maxRequests) {
    return true; // Rate limited
  }

  // Increment counter
  clientData.count++;
  return false;
};

// Clean up old rate limit entries periodically
export const cleanupRateLimitData = (): void => {
  const now = Date.now();
  for (const [clientId, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(clientId);
    }
  }
};
