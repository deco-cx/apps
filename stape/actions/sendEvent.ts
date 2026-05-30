import { AppContext } from "../mod.ts";
import {
  EventData,
  GdprConsentData,
  StapeEventRequest,
} from "../utils/types.ts";
import {
  extractConsentFromHeaders,
  isAnalyticsAllowed,
} from "../utils/gdpr.ts";
import { extractRequestInfo, fetchStapeAPI } from "../utils/fetch.ts";

export interface Props {
  /**
   * @title Event Data
   * @description The event data to send to Stape
   */
  events: EventData[];

  /**
   * @title Client ID
   * @description Unique identifier for the client
   */
  client_id?: string;

  /**
   * @title User ID
   * @description User identifier for cross-device tracking
   */
  user_id?: string;

  /**
   * @title Timestamp (microseconds)
   * @description Event timestamp in microseconds since Unix epoch
   */
  timestamp_micros?: number;

  /**
   * @title User Properties
   * @description Additional user properties
   */
  user_properties?: Record<string, unknown>;

  /**
   * @title Non-Personalized Ads
   * @description Whether to disable personalized ads
   */
  non_personalized_ads?: boolean;

  /**
   * @title Consent Settings
   * @description GDPR consent settings
   */
  consent?: GdprConsentData;
}

/**
 * @title Send Event to Stape
 * @description Sends analytics events to Stape server-side tagging with timeout and robust error handling
 */
export default async function sendEvent(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message?: string }> {
  const { containerUrl, enableGdprCompliance, consentCookieName } = ctx;

  if (!containerUrl) {
    return {
      success: false,
      message: "Container URL not configured",
    };
  }

  // GDPR compliance check
  if (enableGdprCompliance) {
    const cookieHeader = req.headers.get("cookie") || "";
    const consentData = extractConsentFromHeaders(
      cookieHeader,
      consentCookieName,
    );

    if (!isAnalyticsAllowed(consentData)) {
      return {
        success: false,
        message: "Event blocked due to GDPR consent (analytics denied)",
      };
    }
  }

  try {
    // Extract request information
    const { userAgent, clientIp } = extractRequestInfo(req);

    // Build event payload
    const eventPayload: StapeEventRequest = {
      events: props.events,
      client_id: props.client_id || crypto.randomUUID(),
      user_id: props.user_id,
      timestamp_micros: props.timestamp_micros || Date.now() * 1000,
      user_properties: props.user_properties,
      non_personalized_ads: props.non_personalized_ads,
      consent: props.consent,
    };

    // Send to Stape with timeout and error handling
    const result = await fetchStapeAPI(
      containerUrl,
      eventPayload,
      userAgent,
      clientIp,
    );

    if (!result.success) {
      console.error("Stape API error:", result.error);
      return {
        success: false,
        message: result.error || "Failed to send event to Stape",
      };
    }

    return {
      success: true,
      message: "Event sent successfully to Stape",
    };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    console.error("Failed to send event to Stape:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
}
