import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Event Name
   * @description E-commerce event name (purchase, add_to_cart, view_item, etc.)
   */
  eventName: string;

  /**
   * @title Event Parameters
   * @description Event parameters including currency, value, items, etc.
   */
  eventParams: Record<string, unknown>;

  /**
   * @title Client ID
   * @description Client identifier for tracking continuity
   */
  clientId?: string;

  /**
   * @title User ID
   * @description User identifier for cross-device tracking
   */
  userId?: string;

  /**
   * @title Additional Parameters
   * @description Additional custom parameters for the event
   */
  additionalParams?: Record<string, unknown>;
}

/**
 * @title Track E-commerce Event (Server-Side)
 * @description Tracks e-commerce events (purchase, add_to_cart, view_item, etc.) server-side to Stape container
 */
const trackEcommerceEvent = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; eventId?: string; error?: string }> => {
  const { containerUrl, gtmContainerId, enableGdprCompliance } = ctx;

  if (!containerUrl) {
    return {
      success: false,
      error: "Stape container URL not configured",
    };
  }

  try {
    const { eventName, eventParams } = props;
    
    // Validate required event data
    if (!eventName) {
      throw new Error("Event name is required");
    }

    // Generate event ID
    const eventId = crypto.randomUUID();

    // Generate or use client ID
    const clientId = props.clientId || crypto.randomUUID();

    // Check GDPR consent from cookies if enabled
    let hasConsent = true;
    if (enableGdprCompliance) {
      const cookieHeader = req.headers.get("cookie") || "";
      const consentCookie = cookieHeader
        .split("; ")
        .find(row => row.startsWith("cookie_consent="))
        ?.split("=")[1];
      
      hasConsent = consentCookie === "true" || consentCookie === "granted";
    }

    if (!hasConsent) {
      return {
        success: false,
        error: "Event blocked due to GDPR consent",
      };
    }

    // Prepare event data in GA4 format for Stape
    const eventData = {
      events: [{
        name: eventName,
        params: {
          // Spread all event parameters
          ...eventParams,
          // Add additional tracking data
          client_id: clientId,
          user_id: props.userId || undefined,
          timestamp_micros: Date.now() * 1000,
          page_location: req.url,
          page_referrer: req.headers.get("referer") || "",
          ...props.additionalParams,
        },
      }],
      gtm_container_id: gtmContainerId,
      client_id: clientId,
      user_id: props.userId || undefined,
      consent: {
        ad_storage: hasConsent ? "granted" : "denied",
        analytics_storage: hasConsent ? "granted" : "denied",
        ad_user_data: hasConsent ? "granted" : "denied",
        ad_personalization: hasConsent ? "granted" : "denied",
      },
    };

    // Send to Stape container
    const stapeUrl = new URL("/gtm", containerUrl);
    
    const response = await fetch(stapeUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "Deco-Stape-Server/1.0",
        "X-Forwarded-For": req.headers.get("x-forwarded-for") || 
                          req.headers.get("x-real-ip") || 
                          "127.0.0.1",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Stape API error: ${response.status} ${response.statusText}`);
    }

    console.log(`Stape: E-commerce event '${eventName}' tracked successfully`);

    return {
      success: true,
      eventId,
    };

  } catch (error) {
    console.error("Failed to track e-commerce event to Stape:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default trackEcommerceEvent;