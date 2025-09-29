import { AppContext } from "../mod.ts";

// Request timeout configuration
const REQUEST_TIMEOUT_MS = 5000; // 5 seconds

export interface Props {
  /**
   * @title Event Name
   * @description Name of the event to send (e.g., page_view, custom_event)
   */
  eventName: string;

  /**
   * @title Event Parameters
   * @description Event parameters as JSON object
   */
  eventParams?: Record<string, unknown>;

  /**
   * @title Client ID
   * @description Client identifier for tracking
   */
  clientId?: string;

  /**
   * @title User ID
   * @description User identifier for cross-device tracking
   */
  userId?: string;
}

/**
 * @title Send Basic Event to Stape
 * @description Sends basic analytics events to Stape server-side container
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const { containerUrl } = ctx;

  if (!containerUrl) {
    return {
      success: false,
      message: "Container URL not configured",
    };
  }

  try {
    const {
      enableGdprCompliance = true,
      consentCookieName = "cookie_consent",
    } = ctx;
    let hasConsent = true;
    if (enableGdprCompliance) {
      const cookieHeader = req.headers.get("cookie") || "";
      const consentCookie = cookieHeader
        .split("; ")
        .find((row) => row.startsWith(`${consentCookieName}=`))
        ?.split("=")[1];
      hasConsent = consentCookie === "true" || consentCookie === "granted";
    }
    if (!hasConsent) {
      return { success: false, message: "GDPR consent not granted" };
    }

    const eventData = {
      events: [{
        name: props.eventName,
        params: props.eventParams || {},
      }],
      client_id: props.clientId || crypto.randomUUID(),
      user_id: props.userId,
      timestamp_micros: Date.now() * 1000,
    };

    const stapeUrl = new URL("/gtm", containerUrl);
    const userAgent = req.headers.get("user-agent") || "";

    // Setup timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(stapeUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
        },
        body: JSON.stringify(eventData),
        signal: controller.signal,
      });

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Stape request failed: ${response.status} ${response.statusText}. Response: ${errorBody}`,
        );
      }

      return {
        success: true,
        message: `Event "${props.eventName}" sent successfully to Stape`,
      };
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        console.error(`Stape request timeout after ${REQUEST_TIMEOUT_MS}ms`);
        return {
          success: false,
          message: `Request timeout after ${REQUEST_TIMEOUT_MS}ms`,
        };
      }

      console.error("Failed to send event to Stape:", error);
      return {
        success: false,
        message: error instanceof Error
          ? error.message
          : "Unknown error occurred",
      };
    }
  } catch (error) {
    console.error("Failed to send event to Stape:", error);
    return {
      success: false,
      message: error instanceof Error
        ? error.message
        : "Unknown error occurred",
    };
  }
};

export default action;
