import { AppContext } from "../mod.ts";
import {
  EcommerceEvents,
  EventData,
  EventParams,
  Item,
  StapeEventRequest,
} from "../utils/types.ts";
import { isAnalyticsAllowed, parseConsentCookie } from "../utils/gdpr.ts";
import { fetchWithTimeout } from "../utils/fetch.ts";

export interface Props {
  /**
   * @description The type of e-commerce event
   */
  event_name: EcommerceEvents;

  /**
   * @description Custom event name if not using standard events
   */
  custom_event_name?: string;
  currency?: string;
  value?: number;
  transaction_id?: string;
  shipping?: number;
  tax?: number;
  items?: Item[];
  custom_parameters?: Record<string, unknown>;
  timeout?: number;
}

export interface EcommerceEventResponse {
  status: "success" | "error" | "skipped";
  event_name?: string;
  request_data?: StapeEventRequest;
  response_data?: {
    status: number;
    statusText: string;
    body?: string;
  };
  consent_status?: string;
  error?: string;
  request_info?: {
    url: string;
    method: string;
    user_agent?: string;
    ip?: string;
  };
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<EcommerceEventResponse> => {
  const {
    event_name,
    custom_event_name,
    currency,
    value,
    transaction_id,
    shipping,
    tax,
    items = [],
    custom_parameters = {},
    timeout = 5000,
  } = props;

  const cookieHeader = req.headers.get("cookie") || "";
  const consentData = parseConsentCookie(cookieHeader);

  if (!isAnalyticsAllowed(consentData)) {
    return {
      status: "skipped",
      consent_status: "denied",
      request_info: {
        url: req.url,
        method: req.method,
        user_agent: req.headers.get("user-agent") || "",
        ip: req.headers.get("x-forwarded-for") || "",
      },
    };
  }

  const finalEventName = custom_event_name || event_name;
  const clientIdCookie = cookieHeader.match(/client_id=([^;]+)/)?.[1];
  const clientId = clientIdCookie ||
    `${Date.now()}.${Math.random().toString(36).substring(2)}`;

  const eventParams: EventParams = { ...custom_parameters };

  if (currency) eventParams.currency = currency;
  if (value !== undefined) eventParams.value = value;
  if (transaction_id) eventParams.transaction_id = transaction_id;
  if (shipping !== undefined) eventParams.shipping = shipping;
  if (tax !== undefined) eventParams.tax = tax;
  if (items.length > 0) eventParams.items = items;

  eventParams.session_id = req.headers.get("x-session-id") || `${Date.now()}`;
  eventParams.page_location = req.headers.get("referer") || req.url;

  const eventData: EventData = {
    name: finalEventName,
    params: eventParams,
  };

  const stapeRequest: StapeEventRequest = {
    events: [eventData],
    client_id: clientId,
    timestamp_micros: Date.now() * 1000,
    consent: consentData,
  };

  const userId = req.headers.get("x-user-id");
  if (userId) {
    stapeRequest.user_id = userId;
  }

  try {
    const response = await fetchWithTimeout(
      `${ctx.containerUrl}/data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": req.headers.get("user-agent") || "Deco/Stape-App",
        },
        body: JSON.stringify(stapeRequest),
        timeoutMs: timeout,
      },
    );

    return {
      status: "success",
      event_name: finalEventName,
      request_data: stapeRequest,
      response_data: {
        status: response.status || 0,
        statusText: response.statusText || "",
        body: response.data || "",
      },
      consent_status: "granted",
      request_info: {
        url: req.url,
        method: req.method,
        user_agent: req.headers.get("user-agent") || "",
        ip: req.headers.get("x-forwarded-for") || "",
      },
    };
  } catch (error) {
    return {
      status: "error",
      event_name: finalEventName,
      request_data: stapeRequest,
      error: error instanceof Error ? error.message : String(error),
      consent_status: "granted",
      request_info: {
        url: req.url,
        method: req.method,
        user_agent: req.headers.get("user-agent") || "",
        ip: req.headers.get("x-forwarded-for") || "",
      },
    };
  }
};

export default action;
