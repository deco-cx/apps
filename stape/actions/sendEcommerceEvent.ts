import { AppContext } from "../mod.ts";
import { EventData, Item } from "../utils/types.ts";

export interface EcommerceEventProps {
  /**
   * @title Event Name
   * @description Type of e-commerce event
   */
  eventName:
    | "purchase"
    | "add_to_cart"
    | "remove_from_cart"
    | "view_item"
    | "view_item_list"
    | "begin_checkout"
    | "add_payment_info"
    | "add_shipping_info";

  /**
   * @title Transaction ID
   * @description Unique identifier for the transaction (required for purchase)
   */
  transactionId?: string;

  /**
   * @title Currency
   * @description Currency code (ISO 4217)
   * @default BRL
   */
  currency?: string;

  /**
   * @title Total Value
   * @description Total value of the transaction
   */
  value?: number;

  /**
   * @title Items
   * @description Array of items involved in the event
   */
  items: Item[];

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

  /**
   * @title Additional Parameters
   * @description Additional event parameters
   */
  additionalParams?: Record<string, unknown>;
}

/**
 * @title Send E-commerce Event to Stape
 * @description Sends structured e-commerce events to Stape with proper GA4 formatting
 */
export default async function sendEcommerceEvent(
  props: EcommerceEventProps,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string; eventData?: EventData }> {
  const { containerUrl, enableGdprCompliance } = ctx;

  if (!containerUrl) {
    return {
      success: false,
      message: "Container URL not configured",
    };
  }

  if (!props.items || props.items.length === 0) {
    return {
      success: false,
      message: "At least one item is required for e-commerce events",
    };
  }

  try {
    // Build event parameters
    const eventParams: Record<string, unknown> = {
      currency: props.currency || "BRL",
      items: props.items,
      ...props.additionalParams,
    };

    // Add value for events that support it
    if (props.value !== undefined) {
      eventParams.value = props.value;
    }

    // Add/require transaction ID for purchase events
    if (props.eventName === "purchase") {
      if (!props.transactionId) {
        return {
          success: false,
          message: "transactionId is required for purchase events",
        };
      }
      eventParams.transaction_id = props.transactionId;
    }
    const eventData: EventData = {
      name: props.eventName,
      params: eventParams,
    };

    // Read GDPR consent from cookies if compliance is enabled
    let consentData = {
      ad_storage: "unknown" as "granted" | "denied" | "unknown",
      analytics_storage: "unknown" as "granted" | "denied" | "unknown",
      ad_user_data: "unknown" as "granted" | "denied" | "unknown",
      ad_personalization: "unknown" as "granted" | "denied" | "unknown",
    };

    if (enableGdprCompliance) {
      const cookieHeader = req.headers.get("cookie") || "";
      const consentCookieName = ctx.consentCookieName || "cookie_consent";
      const cookieMap = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [k, ...v] = c.split("=");
          return [k.trim(), decodeURIComponent(v.join("=") || "")];
        }),
      );

      const consentValue = cookieMap[consentCookieName];
      let parsedConsent: unknown = null;

      try {
        // Try to parse as JSON first
        parsedConsent = JSON.parse(consentValue || "null");
      } catch {
        // Fallback to string/boolean parsing
        if (consentValue === "true" || consentValue === "granted") {
          parsedConsent = true;
        } else if (consentValue === "false" || consentValue === "denied") {
          parsedConsent = false;
        }
      }

      if (parsedConsent === true || parsedConsent === "granted") {
        consentData = {
          ad_storage: "granted",
          analytics_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
        };
      } else if (parsedConsent === false || parsedConsent === "denied") {
        consentData = {
          ad_storage: "denied",
          analytics_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        };
      } else if (typeof parsedConsent === "object" && parsedConsent !== null) {
        // Handle object-based consent
        const consentObj = parsedConsent as Record<string, string>;
        consentData = {
          ad_storage:
            (consentObj.ad_storage as "granted" | "denied" | "unknown") ||
            "unknown",
          analytics_storage: (consentObj.analytics_storage as
            | "granted"
            | "denied"
            | "unknown") || "unknown",
          ad_user_data:
            (consentObj.ad_user_data as "granted" | "denied" | "unknown") ||
            "unknown",
          ad_personalization: (consentObj.ad_personalization as
            | "granted"
            | "denied"
            | "unknown") || "unknown",
        };
      }

      // Skip event entirely if analytics is denied
      if (consentData.analytics_storage === "denied") {
        console.log(
          "Stape: Event blocked due to GDPR consent (analytics denied)",
        );
        return {
          success: false,
          message: "Event blocked due to GDPR consent",
        };
      }
    } else {
      // Fallback when GDPR compliance is disabled
      consentData = {
        ad_storage: "unknown",
        analytics_storage: "unknown",
        ad_user_data: "unknown",
        ad_personalization: "unknown",
      };
    }

    const payload = {
      events: consentData.analytics_storage === "denied" ? [] : [eventData],
      client_id: props.clientId || crypto.randomUUID(),
      user_id: props.userId,
      timestamp_micros: Date.now() * 1000,
      consent: consentData,
    };

    const stapeUrl = new URL("/gtm", containerUrl);
    const userAgent = req.headers.get("user-agent") || "";
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const response = await fetch(stapeUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        "X-Forwarded-For": clientIp,
        "X-Real-IP": clientIp,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Stape request failed: ${response.status} ${response.statusText}`,
      );
    }

    return {
      success: true,
      message:
        `E-commerce event "${props.eventName}" sent successfully to Stape`,
      eventData,
    };
  } catch (error) {
    console.error("Failed to send e-commerce event to Stape:", error);
    return {
      success: false,
      message: error instanceof Error
        ? error.message
        : "Unknown error occurred",
    };
  }
}
