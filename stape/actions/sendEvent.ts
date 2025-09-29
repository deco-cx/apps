import { AppContext } from "../mod.ts";
import { StapeEventRequest, EventData } from "../utils/types.ts";

export interface Props extends StapeEventRequest {
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
  consent?: {
    ad_storage?: "granted" | "denied";
    analytics_storage?: "granted" | "denied";
    ad_user_data?: "granted" | "denied";
    ad_personalization?: "granted" | "denied";
  };
}

/**
 * @title Send Event to Stape
 * @description Sends analytics events to Stape server-side tagging
 */
export default async function sendEvent(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message?: string }> {
  const { containerUrl } = ctx;

  if (!containerUrl) {
    return {
      success: false,
      message: "Container URL not configured",
    };
  }

  try {
    // Get client IP and user agent from request
    const userAgent = req.headers.get("user-agent") || "";
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

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

    // Send to Stape container
    const stapeUrl = new URL("/gtm", containerUrl);
    
    const response = await fetch(stapeUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        "X-Forwarded-For": clientIp,
        "X-Real-IP": clientIp,
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      throw new Error(`Stape request failed: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      message: "Event sent successfully to Stape",
    };
  } catch (error) {
    console.error("Failed to send event to Stape:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}