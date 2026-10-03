import { AppContext } from "../../mod.ts";
import { type SectionProps } from "@deco/deco";
import {
  extractConsentFromHeaders,
  isAnyTrackingAllowed,
} from "../../utils/gdpr.ts";
import { extractRequestInfo, fetchStapeAPI } from "../../utils/fetch.ts";

// Request timeout configuration
const REQUEST_TIMEOUT_MS = 5000; // 5 seconds

// Type definitions for cleaner code
interface PageViewEventData {
  eventName: "page_view";
  eventParams: {
    page_location: string;
    page_title: string;
    timestamp_micros: number;
    [key: string]: unknown;
  };
}

interface StapeEventPayload {
  events: Array<{
    name: string;
    params: Record<string, unknown>;
  }>;
  client_id: string;
  timestamp_micros: number;
}

// Utility functions
const shouldTrackPageView = (props: Props, containerUrl?: string): boolean =>
  props.trackPageViews !== false &&
  props.enableServerSideTracking !== false &&
  !!containerUrl;

const hasTrackingConsent = (
  req: Request,
  enableGdprCompliance: boolean,
  consentCookieName: string,
): boolean => {
  if (!enableGdprCompliance) return true;

  const cookieHeader = req.headers.get("cookie") || "";
  const consentData = extractConsentFromHeaders(
    cookieHeader,
    consentCookieName,
  );
  return isAnyTrackingAllowed(consentData);
};

const createPageViewEventData = (
  req: Request,
  customParameters?: Record<string, string>,
): PageViewEventData => ({
  eventName: "page_view",
  eventParams: {
    page_location: req.url,
    page_title: "Page View",
    timestamp_micros: Date.now() * 1000,
    ...customParameters,
  },
});

const buildStapePayload = (
  eventData: PageViewEventData,
): StapeEventPayload => ({
  events: [{
    name: eventData.eventName,
    params: eventData.eventParams,
  }],
  client_id: crypto.randomUUID(),
  timestamp_micros: Date.now() * 1000,
});

const logTrackingResult = (
  debugMode: boolean | undefined,
  eventName: string,
  success: boolean,
) => {
  if (debugMode) {
    console.log(`Stape: ${eventName} dispatch:`, { success });
  }
};

const logTrackingError = (
  debugMode: boolean | undefined,
  eventName: string,
  error: unknown,
) => {
  if (debugMode) {
    console.error(`Stape: Failed to send ${eventName} event:`, error);
  }
};

const logConsentBlocked = (
  debugMode: boolean | undefined,
  eventName: string,
) => {
  if (debugMode) {
    console.log(`Stape: ${eventName} blocked by GDPR consent`);
  }
};

export interface Props {
  /**
   * @title Enable Server-Side Events
   * @description Enable automatic server-side event tracking
   * @default true
   */
  enableServerSideTracking?: boolean;

  /**
   * @title Track Page Views
   * @description Automatically track page views server-side
   * @default true
   */
  trackPageViews?: boolean;

  /**
   * @title Custom Event Parameters
   * @description Additional custom parameters to include with all events
   */
  customParameters?: Record<string, string>;

  /**
   * @title Debug Mode
   * @description Enable debug mode for server-side tracking
   * @default false
   */
  debugMode?: boolean;
}

/**
 * @title Stape Server-Side Analytics Configuration
 * @description Configures Stape server-side tagging without client-side JavaScript. All tracking is handled server-side through Deco actions.
 */
export default function StapeConfiguration(
  props: SectionProps<typeof loader>,
) {
  const {
    containerUrl,
    gtmContainerId,
    enableGdprCompliance,
    enableServerSideTracking,
    debugMode,
  } = props;

  // This section only configures server-side tracking
  // No client-side JavaScript is rendered

  if (debugMode) {
    console.log("Stape Configuration:", {
      containerUrl,
      gtmContainerId,
      enableGdprCompliance,
      enableServerSideTracking,
    });
  }

  // Return hidden div with configuration data for debugging
  return (
    <div
      style={{ display: "none" }}
      data-stape-config="true"
      data-container-url={containerUrl}
      data-gtm-id={gtmContainerId}
      data-gdpr-enabled={enableGdprCompliance?.toString()}
      data-server-tracking={enableServerSideTracking?.toString()}
    />
  );
}

export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const {
    containerUrl,
    enableGdprCompliance = true,
    consentCookieName = "cookie_consent",
  } = ctx;

  // Early return if tracking is disabled or no container URL
  if (!shouldTrackPageView(props, containerUrl)) {
    return createLoaderResult(props, ctx);
  }

  // Early return if no consent
  if (!hasTrackingConsent(req, enableGdprCompliance, consentCookieName)) {
    logConsentBlocked(props.debugMode, "page_view");
    return createLoaderResult(props, ctx);
  }

  try {
    await sendPageViewToStape(req, props, containerUrl);
  } catch (error) {
    logTrackingError(props.debugMode, "page_view setup", error);
  }

  return createLoaderResult(props, ctx);
};

const sendPageViewToStape = async (
  req: Request,
  props: Props,
  containerUrl: string,
) => {
  const pageViewData = createPageViewEventData(req, props.customParameters);
  const eventPayload = buildStapePayload(pageViewData);
  const { userAgent, clientIp } = extractRequestInfo(req);

  const result = await fetchStapeAPI(
    containerUrl,
    eventPayload,
    userAgent,
    clientIp,
    REQUEST_TIMEOUT_MS,
  );

  logTrackingResult(props.debugMode, pageViewData.eventName, result.success);

  if (!result.success) {
    logTrackingError(props.debugMode, pageViewData.eventName, result.error);
  }
};

const createLoaderResult = (props: Props, ctx: AppContext) => ({
  ...props,
  containerUrl: ctx.containerUrl,
  gtmContainerId: ctx.gtmContainerId,
  enableGdprCompliance: ctx.enableGdprCompliance,
  consentCookieName: ctx.consentCookieName,
});
