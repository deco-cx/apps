import { AppContext } from "../mod.ts";
import { type SectionProps } from "@deco/deco";
import { extractRequestInfo } from "../utils/fetch.ts";
import {
  logDebugError,
  logDebugMessage,
  type TrackingContext,
} from "../utils/events.ts";
import {
  buildTrackingContext,
  createPageViewEvent,
  sendEventSafely,
} from "../utils/tracking.ts";

// Request timeout configuration
const REQUEST_TIMEOUT_MS = 5000; // 5 seconds

export interface Props {
  /**
   * @title Enable Auto Page Tracking
   * @description Automatically track page views server-side
   * @default true
   */
  enableAutoPageTracking?: boolean;

  /**
   * @title Track E-commerce Events
   * @description Enable automatic e-commerce event tracking
   * @default true
   */
  enableEcommerceTracking?: boolean;

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

  /**
   * @title User Identifier
   * @description Custom user identifier for tracking
   */
  userId?: string;
}

/**
 * @title Stape Server-Side Tracker
 * @description Completely server-side tracking configuration. No client-side JavaScript is executed.
 */
export default function StapeServerTracker(
  props: SectionProps<typeof loader>,
) {
  const {
    containerUrl,
    gtmContainerId,
    enableGdprCompliance,
    enableAutoPageTracking,
    enableEcommerceTracking,
    debugMode,
    pageUrl,
    userAgent,
    clientIp,
  } = props;

  if (debugMode) {
    // Log configuration without exposing sensitive data (GDPR compliance)
    console.log("Stape Server Tracker Configuration:", {
      containerUrl: containerUrl ? "[CONFIGURED]" : "[NOT_SET]",
      gtmContainerId,
      enableGdprCompliance,
      enableAutoPageTracking,
      enableEcommerceTracking,
      pageUrl,
      userAgent: userAgent ? "[PRESENT]" : "[NOT_SET]",
      clientIp: clientIp ? "[PSEUDONYMIZED]" : "[NOT_SET]",
    });
    
    // Server-side only: log full details for debugging (not exposed to client)
    console.info("[Server Debug] Full context:", {
      containerUrl,
      userAgent,
      clientIp, // Only in server logs
    });
  }

  // Helper function to pseudonymize IP for client-side display (GDPR compliance)
  const pseudonymizeIP = (ip: string): string => {
    if (!ip) return 'unknown';
    try {
      const octets = ip.split('.');
      if (octets.length >= 3) {
        const partial = octets.slice(0, 3).join('.');
        const hash = btoa(ip).slice(-4);
        return `${partial}.xxx-${hash}`;
      }
      return 'invalid-ip';
    } catch {
      return 'pseudonym-error';
    }
  };

  // Return a minimal hidden element for configuration tracking
  return (
    <div
      style={{
        display: "none",
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
      data-stape-tracker="server-side"
      data-container-url={containerUrl ? "[CONFIGURED]" : "[NOT_SET]"}
      data-gtm-id={gtmContainerId}
      data-gdpr-enabled={enableGdprCompliance?.toString()}
      data-auto-page-tracking={enableAutoPageTracking?.toString()}
      data-ecommerce-tracking={enableEcommerceTracking?.toString()}
      data-page-url={pageUrl}
      data-user-agent={userAgent ? "[PRESENT]" : "[NOT_SET]"}
      data-client-region={clientIp ? pseudonymizeIP(clientIp) : "unknown"}
      aria-hidden="true"
    />
  );
}

export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const { containerUrl, gtmContainerId } = ctx;
  const { userAgent, clientIp } = extractRequestInfo(req);

  // Early return if auto tracking is disabled or no container URL
  if (props.enableAutoPageTracking === false || !containerUrl) {
    return createLoaderResult(props, ctx, req.url, userAgent, clientIp);
  }

  try {
    const {
      enableGdprCompliance = true,
      consentCookieName = "cookie_consent",
    } = ctx;
    const trackingContext = buildTrackingContext(
      req,
      enableGdprCompliance,
      consentCookieName,
    );

    // Early return if no consent
    if (!trackingContext.hasConsent) {
      logDebugMessage(
        props.debugMode,
        "Stape: Page view blocked due to GDPR consent",
      );
      return createLoaderResult(props, ctx, req.url, userAgent, clientIp);
    }

    await sendPageViewEvent(
      trackingContext,
      props,
      containerUrl,
      gtmContainerId,
      req,
      trackingContext.hasConsent,
    );
  } catch (error) {
    logDebugError(
      props.debugMode,
      "Stape: Failed to auto-track page view:",
      error,
    );
  }

  return createLoaderResult(props, ctx, req.url, userAgent, clientIp);
};

const sendPageViewEvent = async (
  context: TrackingContext,
  props: Props,
  containerUrl: string,
  gtmContainerId: string | undefined,
  req: Request,
  hasConsent: boolean,
) => {
  const eventData = createPageViewEvent(
    context,
    props.customParameters,
    gtmContainerId,
    props.userId,
    hasConsent,
  );

// At the top of the file, alongside your other imports
import { createPageViewEvent, extractSafeReferrer } from "../utils/tracking.ts";

const sendPageViewEvent = async (
  context: TrackingContext,
  props: Props,
  containerUrl: string,
  gtmContainerId: string | undefined,
  req: Request,
  hasConsent: boolean,
) => {
  const eventData = createPageViewEvent(
    context,
    props.customParameters,
    gtmContainerId,
    props.userId,
    hasConsent,
  );

  // Add referrer from request headers safely
  if (eventData.events[0]?.params) {
    eventData.events[0].params.page_referrer = extractSafeReferrer(req);
  }

  // …rest of function unchanged…
};

  const result = await sendEventSafely(
    containerUrl,
    eventData,
    context,
    REQUEST_TIMEOUT_MS,
  );

  if (result.success) {
    logDebugMessage(props.debugMode, "Stape: Auto page view tracked - Success");
  } else {
    logDebugError(
      props.debugMode,
      "Stape: Auto page view tracking failed:",
      result.error,
    );
  }
};

const createLoaderResult = (
  props: Props,
  ctx: AppContext,
  pageUrl: string,
  userAgent: string,
  clientIp: string,
) => ({
  ...props,
  containerUrl: ctx.containerUrl,
  gtmContainerId: ctx.gtmContainerId,
  enableGdprCompliance: ctx.enableGdprCompliance,
  consentCookieName: ctx.consentCookieName,
  pageUrl,
  userAgent,
  clientIp,
});
