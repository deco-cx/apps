import { AppContext } from "../mod.ts";
import { EventData, Item } from "../utils/types.ts";

export interface EcommerceEventProps {
  /**
   * @title Event Name
   * @description Type of e-commerce event
   */
  eventName: "purchase" | "add_to_cart" | "remove_from_cart" | "view_item" | "view_item_list" | "begin_checkout" | "add_payment_info" | "add_shipping_info";

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
  const { containerUrl } = ctx;

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
        return { success: false, message: "transactionId is required for purchase events" };
      }
      eventParams.transaction_id = props.transactionId;
    }
    const eventData: EventData = {
      name: props.eventName,
      params: eventParams,
    };

    const payload = {
      events: [eventData],
      client_id: props.clientId || crypto.randomUUID(),
      user_id: props.userId,
      timestamp_micros: Date.now() * 1000,
      consent: {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      },
    };

    const stapeUrl = new URL('/gtm', containerUrl);
    const userAgent = req.headers.get("user-agent") || "";
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const response = await fetch(stapeUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        'X-Forwarded-For': clientIp,
        'X-Real-IP': clientIp,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Stape request failed: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      message: `E-commerce event "${props.eventName}" sent successfully to Stape`,
      eventData,
    };
  } catch (error) {
    console.error("Failed to send e-commerce event to Stape:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}