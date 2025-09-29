import { AppContext } from "../../mod.ts";
import { type SectionProps } from "@deco/deco";

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
    debugMode 
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

export const loader = (props: Props, req: Request, ctx: AppContext) => {
  const {
    containerUrl,
    gtmContainerId,
    enableGdprCompliance = true,
    consentCookieName = "cookie_consent",
  } = ctx;

import sendBasicEvent from "../../actions/sendBasicEvent.ts";

export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const {
    containerUrl,
    gtmContainerId,
    enableGdprCompliance = true,
    consentCookieName = "cookie_consent",
  } = ctx;

  // Send page view event server-side if enabled
  if (
    props.trackPageViews !== false &&
    props.enableServerSideTracking !== false &&
    containerUrl
  ) {
    // GDPR consent gate
    let hasConsent = true;
    if (enableGdprCompliance) {
      const cookieHeader = req.headers.get("cookie") || "";
      const consentCookie = cookieHeader
        .split("; ")
        .find((row) => row.startsWith(`${consentCookieName}=`))
        ?.split("=")[1];
      hasConsent = consentCookie === "true" || consentCookie === "granted";
    }

    if (hasConsent) {
      // Use sendEvent action to track page view server-side
      const pageViewData = {
        eventName: "page_view",
        eventParams: {
          page_location: req.url,
          page_title: "Page View",
          timestamp_micros: Date.now() * 1000,
          ...props.customParameters,
        },
      };

      const res = await sendBasicEvent(
        { eventName: pageViewData.eventName, eventParams: pageViewData.eventParams },
        req,
        ctx,
      );
      if (props.debugMode) {
        console.log("Stape: page_view dispatch:", res);
      }
    } else if (props.debugMode) {
      console.log("Stape: page_view blocked by GDPR consent");
    }
  }

  // ...rest of loader logic...
};

  return {
    ...props,
    containerUrl,
    gtmContainerId,
    enableGdprCompliance,
    consentCookieName,
  };
};